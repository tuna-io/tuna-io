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
  - Amazon AWS SDK
  - Watson Go SDK
- Redis 3.2.5
- AWS S3
- FFmpeg 3.2
- IBM Watson

#### Client
- React
  - React-DOM 15.3.2
  - React-Dropzone 3.7.3
  - [React-Flexbox-Grid](https://github.com/roylee0704/react-flexbox-grid) 0.10.2
    - classnames 2.2.5
    - css-loader 0.26.0
    - flexboxgrid 6.3.1
    - style-loader 0.13.1
  - React-Router 3.0.0

#### Dev Dependencies
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

Save AWS Key to Config file
- Sign up for your an AWS S3 account, click on **Security** and copy the access key ID and secret access key
- Create a configuration file in your root directory (not the project's root directory)
```
cd
mkdir .aws
vim ~/.aws/credentials
```

Enter the following information into the file
```
[default]
aws_access_key_id = SUPER_SECRET
aws_secret_access_key = EVEN_MORE_SECRET
```

Save and close the file
```
:x
```

Install all NPM dependencies
```
npm install
npm install -g mocha
```

Configure `webpack` to load `flexboxgrid` with CSS modules
```
cd client/node_modules/react-scripts/config
vim webpack.config.prod.js
```

Replace the `css` loaders with:
```
{
  test: /\.css$/,
  loader: 'style!css?modules',
  include: /flexboxgrid/,
},
{
  test: /\.css$/,
  loader: 'style!css!postcss',
  include: path.join(__dirname, 'node_modules'), // oops, this also includes flexboxgrid
  exclude: /flexboxgrid/, // so we have to exclude it
},
```

Build the client
```
cd client
npm run build
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
