package main

import (
	"flag"

	"github.com/SimpleDingo/app"
)

func main() {
	portPtr := flag.String("port", "8000", "The port number for Dingo to listen to.")
	privKeyPathPtr := flag.String("priv-key", "dingo.rsa", "The private key file path for JWT.")
	pubKeyPathPtr := flag.String("pub-key", "dingo.rsa.pub", "The public key file path for JWT.")
	flag.Parse()
	//Dingo.Init()
	Dingo.Init(*privKeyPathPtr, *pubKeyPathPtr)
	Dingo.Run(*portPtr)
}
