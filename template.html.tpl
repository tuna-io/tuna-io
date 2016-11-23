<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>tunavid.io</title>
    <link rel="shortcut icon" href="//{{.Static}}/favicon.ico">
    {{if not .Hot}}<link rel="stylesheet" type="text/css" href="//{{.Style}}" media="all" />{{end}}
    <script src="http://vjs.zencdn.net/5.12.6/video.js"></script>
    <link href="http://vjs.zencdn.net/5.12.6/video-js.css" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="text/javascript" src="//{{.Js}}"></script>
  </body>
</html>
