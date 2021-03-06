/**
 *
 * Wait for an element (selected by css selector) for the provided amount of
 * milliseconds to have a value. If multiple elements get queryied by given
 * selector, it returns true (or false if reverse flag is set) if at least one
 * element has a value.
 *
 * <example>
    :index.html
    <input name="someInput" id="elem" value=""></input>
    <script type="text/javascript">
        setTimeout(function () {
            document.getElementById('elem').value = 'some text';
        }, 2000);
    </script>

    :waitForTextExample.js
    it('should detect when element has value', function () {
        browser.waitForValue('#elem', 3000);

        // same as
        elem = browser.element('#elem');
        elem.waitForValue(3000)
    });
 * </example>
 *
 * @alias browser.waitForValue
 * @param {String}   selector element to wait
 * @param {Number=}  ms       time in ms (default: 500)
 * @param {Boolean=} reverse  if true it waits for the opposite (default: false)
 * @uses util/waitUntil, property/getValue
 * @type utility
 *
 */

import { WaitUntilTimeoutError, isTimeoutError } from '../utils/ErrorHandler'

let waitForValue = function (selector, ms, reverse) {
    /**
     * we can't use default values for function parameter here because this would
     * break the ability to chain the command with an element if reverse is used, like
     *
     * ```js
     * var elem = browser.element('#elem');
     * elem.waitForXXX(10000, true);
     * ```
     */
    reverse = typeof reverse === 'boolean' ? reverse : false

    /*!
     * ensure that ms is set properly
     */
    if (typeof ms !== 'number') {
        ms = this.options.waitforTimeout
    }

    return this.waitUntil(() => {
        return this.getValue(selector).then((value) => {
            if (!Array.isArray(value)) {
                return (value !== '') !== reverse
            }

            let result = reverse
            for (let val of value) {
                if (!reverse) {
                    result = result || val !== ''
                } else {
                    result = result && val === ''
                }
            }

            return result !== reverse
        })
    }, ms).catch((e) => {
        selector = selector || this.lastResult.selector

        if (isTimeoutError(e)) {
            let isReversed = reverse ? 'with' : 'without'
            throw new WaitUntilTimeoutError(`element (${selector}) still ${isReversed} a value after ${ms}ms`)
        }
        throw e
    })
}

export default waitForValue
