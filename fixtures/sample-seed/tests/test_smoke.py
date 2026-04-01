from sample_target import describe_fixture


def test_sample_seed_smoke():
    fixture = describe_fixture()

    assert fixture["name"] == "sample-target"
    assert fixture["status"] == "ready"
    assert fixture["verification"] == "python -m pytest"
