# SSL Certificates for Development

This directory is intended for storing SSL certificates used in development and testing. 

**IMPORTANT: Never store production SSL certificates in this directory, and never commit SSL certificates to version control.**

## Generating Self-Signed Certificates for Development

For development and testing, you can generate self-signed certificates. Here's how to do it using OpenSSL:

### 1. Generate a Private Key

```bash
openssl genrsa -out key.pem 2048
```

### 2. Generate a Certificate Signing Request (CSR)

```bash
openssl req -new -key key.pem -out csr.pem
```

When prompted, enter the required information. For local development, you can use `localhost` as the Common Name.

### 3. Generate a Self-Signed Certificate

```bash
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem
```

### 4. Clean up

```bash
rm csr.pem
```

### 5. Update Environment Variables

Update your `.env` file with the paths to your certificates:

```
SSL_KEY_PATH=path/to/server/ssl/key.pem
SSL_CERT_PATH=path/to/server/ssl/cert.pem
```

## Browser Trust

When using self-signed certificates in development, browsers will show warnings. You can:

1. Add an exception for the certificate in your browser
2. For Chrome/Edge, type `thisisunsafe` when on the warning page
3. For Firefox, click "Advanced" and then "Accept the Risk and Continue"

## Production Environments

For production environments, use certificates from a trusted Certificate Authority (CA) like Let's Encrypt, and set the paths in your environment variables:

```
SSL_KEY_PATH=/path/to/production/key.pem
SSL_CERT_PATH=/path/to/production/cert.pem
```

Never store production certificates in version control. Use secure methods to deploy them to your servers. 