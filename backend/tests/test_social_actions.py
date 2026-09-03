def test_like_and_unlike_post(client, user_factory, post_factory):
    user = user_factory()
    post_id = post_factory(user)

    liked = client.post(
        "/likes",
        headers=user.headers,
        json={"target_id": post_id, "type": "post"},
    )
    duplicate = client.post(
        "/likes",
        headers=user.headers,
        json={"target_id": post_id, "type": "post"},
    )
    detail = client.get(f"/posts/{post_id}", headers=user.headers)
    unliked = client.delete(
        "/likes",
        headers=user.headers,
        json={"target_id": post_id, "type": "post"},
    )
    detail_after_unlike = client.get(f"/posts/{post_id}", headers=user.headers)

    assert liked.status_code == 201
    assert duplicate.status_code == 400
    assert detail.get_json()["post"]["like_count"] == 1
    assert detail.get_json()["post"]["liked"] is True
    assert unliked.status_code == 200
    assert detail_after_unlike.get_json()["post"]["like_count"] == 0


def test_like_reply(client, user_factory, post_factory):
    user = user_factory()
    post_id = post_factory(user)
    reply = client.post(
        "/replies",
        headers=user.headers,
        data={"post_id": post_id, "body": "Reply"},
    )
    reply_id = reply.get_json()["reply_id"]

    liked = client.post(
        "/likes",
        headers=user.headers,
        json={"target_id": reply_id, "type": "reply"},
    )
    detail = client.get(f"/posts/{post_id}", headers=user.headers)

    assert liked.status_code == 201
    assert detail.get_json()["replies"][0]["like_count"] == 1
    assert detail.get_json()["replies"][0]["liked"] is True


def test_follow_and_unfollow_user(client, user_factory):
    follower = user_factory()
    followee = user_factory()

    followed = client.post(
        "/follows",
        headers=follower.headers,
        json={"followee_id": followee.user_id},
    )
    duplicate = client.post(
        "/follows",
        headers=follower.headers,
        json={"followee_id": followee.user_id},
    )
    profile = client.get(f"/users/{followee.user_id}", headers=follower.headers)
    unfollowed = client.delete(
        "/follows",
        headers=follower.headers,
        json={"followee_id": followee.user_id},
    )
    profile_after = client.get(
        f"/users/{followee.user_id}", headers=follower.headers
    )

    assert followed.status_code == 201
    assert duplicate.status_code == 400
    assert profile.get_json()["is_following"] is True
    assert unfollowed.status_code == 200
    assert profile_after.get_json()["is_following"] is False


def test_user_cannot_follow_self(client, user_factory):
    user = user_factory()

    response = client.post(
        "/follows", headers=user.headers, json={"followee_id": user.user_id}
    )

    assert response.status_code == 400

