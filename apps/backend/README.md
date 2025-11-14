# Backend Endpoints


### **Users**

* `POST /users` → create user (after Clerk signup, sync Clerk user to your DB)
* `GET /users/me` → get my profile (Clerk JWT auth)
* `PATCH /users/me` → update profile (name, phone, picture)
* `DELETE /users/me` → soft delete account (set `deleted_at`)

### **Addresses**

* `POST /users/me/addresses` → add address
* `GET /users/me/addresses` → list my addresses
* `PATCH /users/me/addresses/:id` → update address
* `DELETE /users/me/addresses/:id` → delete address
* `PATCH /users/me/addresses/:id/default` → set default address

### **Loyalty Points**

* `GET /users/me/loyalty` → get current balance + history
*  `GET /users/me/loyalty/balance` → returns only current balance
* `POST /loyalty/redeem` → redeem points
* (Admin/system only) `POST /loyalty/adjust` → adjust points manually


### Run Ngrok docker

* To create user using webhooks from the clerk
`docker run --name ngrok --net=host -it -e NGROK_AUTHTOKEN=xyz ngrok/ngrok:latest http 8080`

docker logs -f keen_wu

### Run elasticsearch and kibana docker container

`docker network create elastic`
`docker  network connect <net_name> <container_name>`

By default ES uses half of the system memory
``docker run -d \
  --name elasticsearch \
  --net elastic \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  docker.elastic.co/elasticsearch/elasticsearch:8.15.0
  ```

Cmd to constaraint the RAM used by ES
  ```docker run -d \
    --name elasticsearch \
    --net elastic \
    -p 9200:9200 \
    -e "discovery.type=single-node" \
    -e "xpack.security.enabled=false" \
    -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
    --memory="1g" \
    docker.elastic.co/elasticsearch/elasticsearch:8.15.0
  ```

```docker run -d \
  --name kibana \
  --net elastic \
  -p 5601:5601 \
  -e "ELASTICSEARCH_HOSTS=http://elasticsearch:9200" \
  docker.elastic.co/kibana/kibana:8.15.0
```


### ERR
```
Error>
<Code>AccessDenied</Code>
<Message>Access Denied.</Message>
<Key>vendors/images/Gemini_Generated_Image_7h28667h28667h28.png_1762349190</Key>
<BucketName>khaja-bucket</BucketName>
<Resource>/khaja-bucket/vendors/images/Gemini_Generated_Image_7h28667h28667h28.png_1762349190</Resource>
<RequestId>1875EBA6A4FD64D0</RequestId>
<HostId>dd9025bab4ad464b049177c95eb6ebf374d3b3fd1af9251148b658df7ac2e3e8</HostId>
</Error>
```
- Step 1

```bash
docker exec -it <minio_container_name> sh
```

- Step 2

```bash
mc alias set minio http://localhost:9000 minioadmin minioadmin
mc anonymous set download minio/khaja-bucket

```


### Kafka 

```bash 
  docker run -d \
  --name zookeeper \
  -p 2181:2181 \
  -e ZOOKEEPER_CLIENT_PORT=2181 \
  confluentinc/cp-zookeeper:7.5.0
```
```bash 
  docker run -d \
  --name kafka \
  -p 9092:9092 \
  --link zookeeper \
  -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 \
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
  -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
  confluentinc/cp-kafka:7.5.0
```

##### Kraft Mode
```bash 
   docker run -d \
  --name kafka \
  -p 9092:9092 \
  -e KAFKA_BROKER_ID=1 \
  -e KAFKA_KRAFT_MODE=true \
  -e KAFKA_CONTROLLER_QUORUM_VOTERS=1@localhost:9093 \
  -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093 \
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
  -e KAFKA_PROCESS_ROLES=broker,controller \
  -e KAFKA_NUM_PARTITIONS=1 \
  -e KAFKA_AUTO_CREATE_TOPICS_ENABLE=true \
  confluentinc/cp-kafka:7.5.0
```
