StackEdit SSH Proxy
===================

SSH proxy for StackEdit. Allows StackEdit to upload documents on SSH servers.

**Usage:**

	npm install
	node server.js

**Change SSH proxy in StackEdit:**

![StackEdit settings][1]


Deploy on Heroku
----------------

 - Create the application:

		heroku create

 - Rename the application:

		heroku apps:rename stackedit-ssh-proxy

 - Push changes to Heroku:

		git push heroku master


> Written with [StackEdit](http://benweet.github.io/stackedit/).


  [1]: https://raw.github.com/benweet/stackedit-ssh-proxy/master/stackedit-settings.png