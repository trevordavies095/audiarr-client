I use this client to test my [audiarr](https://github.com/trevordavies095/audiarr) project.

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
