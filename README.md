# tuna.io

> The sixth fastest fish in the sea

## Team

  - __Product Owners__: Bill Zito, Christopher Tham
  - __Scrum Master__: Bobby Wei
  - __Development Team Members__: 

## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Tasks](#tasks)
1. [Team](#team)
1. [Contributing](#contributing)

## Usage

> Some usage instructions

## Requirements

- GoLang 1.7.3
- Redis
- AWS
- React
- etc (TODO: include versions)

## Development

### Installing Dependencies

From within the root directory:

Install Homebrew package manager (if required)
```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
brew update
```

Install Go Version Manager (GVM)
Replace `bash` with `zsh` based on shell
```
bash < <(curl -s -S -L https://raw.githubusercontent.com/moovweb/gvm/master/binscripts/gvm-installer)
```

Mac OSX Dependencies
```
xcode-select --install
brew install mercurial
```

Debian/Ubuntu Dependencies
```
sudo apt-get install curl git mercurial make binutils bison gcc build-essential
```

Install GoLang (Note: Go 1.5+ removed the C compilers from the toolchain so in order to compile Go 1.5+, you need to have an existing Go install)
```
gvm install go1.4 -B
gvm use go1.4
export GOROOT_BOOTSTRAP=$GOROOT
gvm install go1.7.3
gvm use go1.7.3 --default
```

Set up `GOPATH` and `PATH` to access `go` executable
```
gvm pkgset create tuna
gvm pkgset use tuna --default
gvm pkgenv tuna
```

Inside the environment, edit the following
```
export GOPATH; GOPATH="/root/pathtothisrepo/server/go:$GOPATH"
export PATH; PATH="/root/pathtothisrepo/server/go/bin:$PATH"
```

Use the `pkgset` to instantiate our environment
```
gvm pkgset use tuna
```

Install Redis
```
wget http://download.redis.io/releases/redis-3.2.5.tar.gz
tar xzf redis-3.2.5.tar.gz
cd redis-3.2.5
make
```

Startup Redis Server
```
redis-server
```

Install all Go dependencies and start up the server!
```
go get
go run main.go
```

### Roadmap

View the project roadmap [here](https://github.com/tuna-io/tuna-io/issues)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
