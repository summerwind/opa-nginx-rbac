# RBAC on Nginx with Open Policy Agent

This repository demonstrates how to implement role based access control (RBAC) on Nginx with Open Policy Agent.

## How to use

First, start the container of Nginx and Open Policy Agent.

```
$ docker-compose up -d
```

When you send a request to `/compute/` using Alice's client certificate, nginx will grant access based on role definition.

```
$ curl -k --cert ./nginx/tls/alice.pem --key ./nginx/tls/alice-key.pem https://127.0.0.1:8080/compute/
```

For requests to `/storage/` as well, nginx allows too.

```
$ curl -k --cert ./nginx/tls/alice.pem --key ./nginx/tls/alice-key.pem https://127.0.0.1:8080/storage/
```

Access is allowed even if you send a request to `/compute/` using Bob's client certificate.

```
$ curl -k --cert ./nginx/tls/bob.pem --key ./nginx/tls/bob-key.pem https://127.0.0.1:8080/compute/
```

However, Bob can not access to `/storage/` based on role definition.

```
$ curl -k --cert ./nginx/tls/bob.pem --key ./nginx/tls/bob-key.pem https://127.0.0.1:8080/storage/
```

## Generating a new client certificate

This repository uses a client certificate for user authentication. We use [CFSSL](https://github.com/cloudflare/cfssl) to issue client certificates. How to issue a new client certificate as follows.

Generate a new CSR definition of CFSSL.

```
$ cd nginx/tls
$ cfssl print-defaults csr > client-csr.json
```

Rewrite the CSR definition as you need.

```
$ vim client-csr.json
```

Generate client certificate files by using CSR definition.

```
$ cfssl gencert -ca=ca.pem -ca-key=ca-key.pem client-csr.json | cfssljson -bare client
```

You can use the new client certificate.

```
$ curl -k --cert ./nginx/tls/client.pem --key ./nginx/tls/client-key.pem https://127.0.0.1:8080/compute
```

## Defining roles and role bindings

Authorization by RBAC is implemented by the combination of Nginx and Open Policy Agent. 

The Role definition is defined in the JSON file as follows. The role has a combination of a path and an list of HTTP methods allowing access, and the Open Policy Agent performs authorization based on the role. 

```
{
  "roles": {
    "compute.admin": {
      "/compute/": ["GET", "POST", "PUT", "DELETE"]
    },
    "compute.viewer": {
      "/compute/": ["GET"]
    },
    "storage.admin": {
      "/storage/": ["GET", "POST", "PUT", "DELETE"]
    },
    "storage.viewer": {
      "/storage/": ["GET"]
    }
  },

  "role_bindings": {
    "alice":   ["compute.admin", "storage.admin"],
    "bob":     ["compute.viewer"]
  }
}
```

You can add a new role or role binding to the role definition.

```
$ vim opa/rbac.json
```
