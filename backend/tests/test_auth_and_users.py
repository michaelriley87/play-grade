def test_health_check(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.get_json() == {"status": "ok"}


def test_api_documentation_spec_is_generated(client):
    response = client.get("/apispec_1.json")
    specification = response.get_json()

    assert response.status_code == 200
    assert specification["info"]["title"] == "PlayGrade API"
    assert "/users/register" in specification["paths"]
    assert "/posts" in specification["paths"]
    assert "/likes" in specification["paths"]


def test_registration_and_login(client):
    registration = client.post(
        "/users/register",
        json={
            "username": "alice",
            "email": "alice@example.test",
            "password": "Password123!",
        },
    )
    login = client.post(
        "/users/login",
        json={"email": "alice@example.test", "password": "Password123!"},
    )

    assert registration.status_code == 201
    assert registration.get_json()["user_id"] == 1
    assert login.status_code == 200
    assert login.get_json()["token"]


def test_registration_validates_fields_and_duplicates(client, user_factory):
    user_factory(username="alice", email="alice@example.test")

    missing = client.post("/users/register", json={})
    duplicate_username = client.post(
        "/users/register",
        json={
            "username": "alice",
            "email": "different@example.test",
            "password": "Password123!",
        },
    )
    duplicate_email = client.post(
        "/users/register",
        json={
            "username": "different",
            "email": "alice@example.test",
            "password": "Password123!",
        },
    )

    assert missing.status_code == 400
    assert duplicate_username.status_code == 400
    assert duplicate_email.status_code == 400


def test_login_rejects_bad_credentials(client, user_factory):
    user = user_factory()

    response = client.post(
        "/users/login", json={"email": user.email, "password": "wrong-password"}
    )

    assert response.status_code == 400


def test_profile_updates_require_owner(client, user_factory):
    owner = user_factory()
    other = user_factory()

    forbidden = client.patch(
        f"/users/{owner.user_id}/username",
        headers=other.headers,
        json={"username": "hijacked"},
    )
    updated = client.patch(
        f"/users/{owner.user_id}/username",
        headers=owner.headers,
        json={"username": "updated-name"},
    )
    profile = client.get(f"/users/{owner.user_id}", headers=owner.headers)

    assert forbidden.status_code == 403
    assert updated.status_code == 200
    assert profile.get_json()["username"] == "updated-name"


def test_password_change_invalidates_old_password(client, user_factory):
    user = user_factory()
    changed = client.patch(
        f"/users/{user.user_id}/password",
        headers=user.headers,
        json={
            "current_password": user.password,
            "new_password": "DifferentPassword123!",
        },
    )

    old_login = client.post(
        "/users/login", json={"email": user.email, "password": user.password}
    )
    new_login = client.post(
        "/users/login",
        json={"email": user.email, "password": "DifferentPassword123!"},
    )

    assert changed.status_code == 200
    assert old_login.status_code == 400
    assert new_login.status_code == 200
