def test_post_requires_authentication(client):
    response = client.post("/posts", data={})

    assert response.status_code == 401


def test_create_read_and_serve_post_image(client, user_factory, post_factory):
    user = user_factory()
    post_id = post_factory(user)

    detail = client.get(f"/posts/{post_id}", headers=user.headers)
    image = client.get(detail.get_json()["post"]["image_url"])

    assert detail.status_code == 200
    assert detail.get_json()["post"]["title"] == "Test post"
    assert detail.get_json()["post"]["liked"] is False
    assert image.status_code == 200
    assert image.mimetype == "image/png"


def test_feed_filters_comma_separated_categories(client, user_factory, post_factory):
    user = user_factory()
    game_post = post_factory(user, title="Game", category="🎮 Games")
    post_factory(user, title="Film", category="🎥 Film/TV")
    music_post = post_factory(user, title="Music", category="🎵 Music")

    response = client.get(
        "/posts",
        query_string={"categories": "🎮 Games,🎵 Music", "page": 1, "limit": 10},
    )
    returned_ids = {post["post_id"] for post in response.get_json()["posts"]}

    assert response.status_code == 200
    assert returned_ids == {game_post, music_post}


def test_reply_updates_post_and_can_be_deleted(client, user_factory, post_factory):
    user = user_factory()
    post_id = post_factory(user)

    created = client.post(
        "/replies",
        headers=user.headers,
        data={"post_id": post_id, "body": "A reply"},
    )
    detail = client.get(f"/posts/{post_id}", headers=user.headers)
    deleted = client.delete(
        f"/replies/{created.get_json()['reply_id']}", headers=user.headers
    )
    detail_after_delete = client.get(f"/posts/{post_id}", headers=user.headers)

    assert created.status_code == 201
    assert detail.get_json()["post"]["reply_count"] == 1
    assert len(detail.get_json()["replies"]) == 1
    assert deleted.status_code == 200
    assert detail_after_delete.get_json()["post"]["reply_count"] == 0


def test_only_owner_can_delete_post(client, user_factory, post_factory):
    owner = user_factory()
    other = user_factory()
    post_id = post_factory(owner)

    forbidden = client.delete(f"/posts/{post_id}", headers=other.headers)
    deleted = client.delete(f"/posts/{post_id}", headers=owner.headers)
    missing = client.get(f"/posts/{post_id}")

    assert forbidden.status_code == 403
    assert deleted.status_code == 200
    assert missing.status_code == 404

