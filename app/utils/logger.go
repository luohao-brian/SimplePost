package utils

import (
	"fmt"
	"os"

	"github.com/fatih/color"
)

func Output(s string) {
	bold := color.New(color.Bold).SprintFunc()
	green := color.New(color.FgGreen).SprintFunc()
	fmt.Printf("%s: %s\n", green(bold("dingo")), s)
}

func logErr(err error) {
	if err != nil {
		Output(color.RedString(err.Error()))
	}
}

func LogOnError(err error, msg string, appendErr ...bool) {
	if err != nil {
		if len(appendErr) > 0 {
			if appendErr[0] {
				logErr(fmt.Errorf("%s: %s", err, msg))
			} else {
				logErr(fmt.Errorf("%s", msg))
			}
		}
	}
}

func LogOnSuccess(err error, msg string) {
	if err == nil {
		Output(msg)
	}
}

func LogOnEither(err error, successMsg, errorMsg string, appendErr ...bool) {
	LogOnSuccess(err, successMsg)
	LogOnError(err, errorMsg, appendErr...)
}

func FailOnError(err error, msg string, appendErr ...bool) {
	if err != nil {
		LogOnError(err, msg, appendErr...)
		os.Exit(1)
	}
}
