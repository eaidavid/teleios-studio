# Publicar no servidor da Agência Teleios

O site é estático (React). Depois do build, basta copiar a pasta `frontend/build/` para a raiz do site no servidor.

## Gerar o build

```bash
cd frontend
yarn install --frozen-lockfile
CI=false yarn build
```

O resultado fica em `frontend/build/` (inclui `index.html`, `static/` e `.htaccess`).

## Subir

Copie **o conteúdo** de `frontend/build/` (inclusive o arquivo oculto `.htaccess`) para a pasta pública do domínio
`agenciateleios.com.br` (ex.: `public_html/` ou `/var/www/agenciateleios`).

```bash
rsync -avz --delete frontend/build/ usuario@149.78.186.232:/var/www/agenciateleios/
```

## Rotas (obrigatório)

Todas as rotas precisam devolver o `index.html`.

- **Apache / hospedagem com cPanel:** já resolvido pelo `.htaccess` incluído no build.
- **Nginx:** adicione ao bloco `server` do domínio:

```nginx
root /var/www/agenciateleios;
index index.html;

location /static/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

location / {
  try_files $uri /index.html;
}
```

## Domínio

`www.agenciateleios.com.br` deve redirecionar para `agenciateleios.com.br` (ou servir o mesmo conteúdo). Ative HTTPS
(ex.: `certbot --nginx -d agenciateleios.com.br -d www.agenciateleios.com.br`).
