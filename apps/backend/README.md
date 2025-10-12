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
`docker run --net=host -it -e NGROK_AUTHTOKEN=xyz ngrok/ngrok:latest http 8080`

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



