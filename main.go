package main

import (
	"flag"

	"github.com/luohao-brian/SimplePosts/app"
)

func main() {
	portPtr := flag.String("port", "8000", "The port number for Dingo to listen to.")
	privKeyPathPtr := flag.String("priv-key", "SimplePosts.rsa", "The private key file path for JWT.")
	pubKeyPathPtr := flag.String("pub-key", "SimplePosts.rsa.pub", "The public key file path for JWT.")
	flag.Parse()
	//Dingo.Init()
	Dingo.Init(*privKeyPathPtr, *pubKeyPathPtr)
	Dingo.Run(*portPtr)
}
