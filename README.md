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
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so

<VirtualHost *:80>
  ServerName simgait.org
  ServerAlias www.simgait.org

  [ ... ]

  RewriteEngine on

  RewriteCond %{SERVER_NAME} =%{SERVER_NAME} [OR]
  RewriteCond %{SERVER_NAME} =www.%{SERVER_NAME}
  RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]
</VirtualHost>

<VirtualHost *:443>
  ServerName simgait.org
  ServerAlias www.simgait.org

  [ ... ]

  RewriteEngine on

  RewriteCond %{SERVER_NAME} =www.simgait.org
  RewriteRule ^ https://simgait.org%{REQUEST_URI} [END,NE,R=permanent]

  # port redirection rules (for session_server.py, simulation_server.py and webots)
  RewriteRule ^/(\d*)/(.*)$ "http://%{SERVER_NAME}:$1/$2" [P,L]
  # websockets (may not be needed)
  RewriteCond %{HTTP:Upgrade} websocket [NC]
  RewriteCond %{HTTP:Connection} upgrade [NC]
  RewriteRule ^/(\d*)/(.*)$ "ws://%{SERVER_NAME}:$1/$2" [P,L]
</VirtualHost>
```

## Reference to a simulation hosted on github

In order to refer to a specific simulation hosted on a github repository, we should the following protocol:

`webots://github.com/user/repo/type/name/folder/subfolder/[...]/subsubfolder/worlds/world.wbt`

Examples:

Referring to the `master` branch: [webots://github.com/cyberbotics/webots/branch/master/projects/samples/robotbenchmark/humanoid_sprint/worlds/humanoid_sprint.wbt](https://github.com/cyberbotics/webots/tree/master/projects/samples/robotbenchmark/humanoid_sprint/worlds/humanoid_sprint.wbt)

Referring to the `R2020a-rev1` tag: [webots://github.com/cyberbotics/webots/tag/R2020a-rev1/projects/samples/robotbenchmark/inverted_pendulum/worlds/inverted_pendulum.wbt](https://github.com/cyberbotics/webots/tree/R2020a-rev1/projects/samples/robotbenchmark/inverted_pendulum/worlds/inverted_pendulum.wbt)

When speficied this way, the whole project will be downloaded (e.g., not only the world file, but all the project folder, including controllers, protos, plugins, etc.).


## Automatic git synchronization and testing website

The main web site is stored on the server in `/var/www/master/html`.
It is synchronized automatically with the `html` folder of the `master` branch of this github repository.
Similarly, the testing web site is stored on the server in `/var/www/testing/html`.
It is synchronized automatically with the `html` folder of the `testing` branch of this github repository.
The `deploy.php` script is called by a github webhook on the push event.
It performs a git pull in the folder corresponding to the branch of the push event.
