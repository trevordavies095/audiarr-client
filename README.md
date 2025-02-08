# Audiarr Client (Test Project)

This is an **experimental client** for testing [audiarr](https://github.com/trevordavies095/audiarr). I am **not a frontend dev**, so this code is rough and not production-ready.

Feel free to **use, modify, or contribute**, but don’t expect perfection.

![audiarr-client](https://i.imgur.com/hjxnes3.png)

Build:
```bash
docker build -t audiarr-client .
```

Run:
```bash
docker run -d -p 2934:80 --name audiarr-client audiarr-client
```

or just use the docker-compose.yml 
