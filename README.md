# simgait.org

This repository hosts the source code of [simgait.org](https://simgait.org).

The SimGait project is a four year project funded by the [SNSF](http://www.snf.ch).
It aims at creating a musculoskeletal model of the human with neural control to model healthy and impaired gait, for example due to cerebral palsy. [simgait.org](https://simgait.org) contains a webservice allowing to run musculoskeletal simulations from the web.

## Setup

[simgait.org](https://simgait.org) runs on a fairly powerful hardware:

- Intel Core i7 950 @ 3.07 GHz
- NVIDIA GeForce GTX 970

The BIOS was configured to reboot the machine after a power outage.

The following software is installed:

- Ubuntu 18.04 Desktop with `apache2`, `php`, `git` and `webots` (from the snap store).

A letsencrypt certificate was installed on enable https.
Apache was configured with rewrite rules to:

1. Redirect all traffic from http to the https.
2. Redirect WebSocket traffic from `wss://servername/<port_number>` to `ws://servername:<port_number>`.

```
LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so  # to enable WebSocket redirection

<VirtualHost *:443>
  ServerName simgait.org

  [ ... ]

  RewriteEngine on

  RewriteCond %{SERVER_NAME} =%{SERVER_NAME} [OR]
  RewriteCond %{SERVER_NAME} =www.%{SERVER_NAME}
  RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]

  RewriteCond %{HTTP:Upgrade} websocket [NC]
  RewriteCond %{HTTP:Connection} upgrade [NC]
  RewriteRule ^/(\d*)$ "ws://%{SERVER_NAME}:$1/" [P,L]

</VirtualHost>
```

We plan to install [CodeIgniter4](/codeigniter4/codeigniter4/) to use it as a PHP web framework.

## Automatic git synchronization and testing website

The main web site is stored on the server in `/var/www/master/html`.
It is synchronized automatically with the `html` folder of the `master` branch of this github repository.
Similarly, the testing web site is stored on the server in `/var/www/testing/html`.
It is synchronized automatically with the `html` folder of the `testing` branch of this github repository.
The `deploy.php` script is called by a github webhook on the push event.
It performs a git pull in the folder corresponding to the branch of the push event.
