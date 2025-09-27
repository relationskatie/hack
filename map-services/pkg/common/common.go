package common

import "time"

// DoWithTries attempts to execute the provided function `fn` up to `attempts` times,
// waiting `delay` duration between each attempt if `fn` returns an error.
//
// It returns nil if `fn` succeeds within the allowed attempts, otherwise it returns
// the last error returned by `fn`.
func DoWithTries(fn func() error, attempts int, delay time.Duration) error {
	var err error
	for attempts > 0 {
		if err = fn(); err != nil {
			time.Sleep(delay)
			attempts--
			continue
		}
		return nil
	}
	return err
}
