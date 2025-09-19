# Backend Endpoints


### **Users**

* `POST /users` → create user (after Clerk signup, sync Clerk user to your DB)
* `GET /users/me` → get my profile (Clerk JWT auth)
* `PUT /users/me` → update profile (name, phone, picture)
* `DELETE /users/me` → soft delete account (set `deleted_at`)

### **Addresses**

* `POST /users/me/addresses` → add address
* `GET /users/me/addresses` → list my addresses
* `PUT /users/me/addresses/:id` → update address
* `DELETE /users/me/addresses/:id` → delete address
* `PATCH /users/me/addresses/:id/default` → set default address

### **Loyalty Points**

* `GET /users/me/loyalty` → get current balance + history
* `POST /loyalty/redeem` → redeem points
* (Admin/system only) `POST /loyalty/adjust` → adjust points manually
