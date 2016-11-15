# tuna.io

> The sixth fastest fish in the sea
> [tunavid.io](http://tunavid.io)

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
  - [Gorilla Web Toolkit](http://www.gorillatoolkit.org/)
    - Gorilla Mux
    - Gorilla Schema
  - [Redigo](https://github.com/garyburd/redigo)
- Redis 3.2.5
- AWS S3
- React
- FFmpeg 3.2
- IBM Watson

Dev Dependencies
- [APIDoc](https://github.com/apidoc/apidoc) 0.16.1
- [Redis Commander](https://github.com/joeferner/redis-commander)

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
export GOPATH; GOPATH="/root/pathtothisrepo/server:$GOPATH"
export PATH; PATH="/root/pathtothisrepo/server/bin:$PATH"
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

Install FFmpeg (for server-side conversion of video files to audio files) - for Mac OSX
```
brew install ffmpeg --with-fdk-aac --with-ffplay --with-freetype --with-frei0r --with-libass --with-libvo-aacenc --with-libvorbis --with-libvpx --with-opencore-amr --with-openjpeg --with-opus --with-rtmpdump --with-schroedinger --with-speex --with-theora --with-tools
```

Install FFmpeg - for Ubuntu (tested on v14.04)
```
// Allow `add-apt-repository` command
sudo apt-get install software-properties-common python-software-properties

// Press [enter] after to confirm
sudo add-apt-repository ppa:mc3man/trusty-media
sudo apt-get update
sudo apt-get dist-upgrade
sudo apt-get install ffmpeg
```

(Dev only) Dependencies:
- For API documentation generation, we use [APIDOC](http://apidocjs.com)
```
npm install -g apidoc
apidoc
```

- For Redis GUI, we use [REDIS COMMANDER](https://github.com/joeferner/redis-commander)
```
npm install -g redis-commander
redis-commander
```

Update IBM Watson API Keys
- Duplicate `keys-example.json` and rename the file to: `keys.json`
- Sign up for an IBM BlueMix account
- Register for a user and pass for the speech-to-text service
- Update `keys.json` with your API keys

Install all NPM dependencies
```
npm install
npm install -g mocha
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
