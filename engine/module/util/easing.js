/* ============================================================
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Open source under the BSD License.
 *
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * https://raw.github.com/danro/jquery-easing/master/LICENSE
 * ======================================================== */

/**
 * easing module
 * @module util/easing
 * @see http://gsgd.co.uk/sandbox/jquery/easing/
 * @example
 * // easing.linear(currentTime, firstValue, changeAmount, duration);
 * easing.linear(0, 10, 40, 100);
 */
define("util/easing", {
    linear: function(t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        return b + c * (t / d);
    },
    easeInQuad: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        return c*(t/=d)*t + b;
    },
    easeOutQuad: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        return -c *(t/=d)*(t-2) + b;
    },
    easeInOutQuad: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        if ((t /= d/2) < 1) return c/2*t*t + b;
        return -c/2 * ((--t)*(t-2) - 1) + b;
    },
    easeInCubic: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        return c*(t/=d)*t*t + b;
    },
    easeOutCubic: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        return c*((t=t/d-1)*t*t + 1) + b;
    },
    easeInOutCubic: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        if ((t /= d/2) < 1) return c/2*t*t*t + b;
        return c/2*((t-=2)*t*t + 2) + b;
    },
    easeInQuart: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        return c*(t/=d)*t*t*t + b;
    },
    easeOutQuart: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        return -c * ((t=t/d-1)*t*t*t - 1) + b;
    },
    easeInOutQuart: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        if ((t /= d/2) < 1) return c/2*t*t*t*t + b;
        return -c/2 * ((t-=2)*t*t*t - 2) + b;
    },
    easeInQuint: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        return c*(t/=d)*t*t*t*t + b;
    },
    easeOutQuint: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        return c*((t=t/d-1)*t*t*t*t + 1) + b;
    },
    easeInOutQuint: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        if ((t /= d/2) < 1) return c/2*t*t*t*t*t + b;
        return c/2*((t-=2)*t*t*t*t + 2) + b;
    },
    easeInSine: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
    },
    easeOutSine: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        return c * Math.sin(t/d * (Math.PI/2)) + b;
    },
    easeInOutSine: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
    },
    easeInExpo: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        return (t === 0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
    },
    easeOutExpo: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
    },
    easeInOutExpo: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        if ((t /= d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
        return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
    },
    easeOutCirc: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
    },
    easeInOutCirc: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        if ((t /= d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
        return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
    },
    easeInElastic: function (t, b, c, d) {
        var s=1.70158;var p=0;var a=c;
        if (t <= 0) return b;
        if (t >= d) return b + c;
        if ((t/=d)==1) return b+c;  if (!p) p=d*0.3;
        if (a < Math.abs(c)) { a=c; s=p/4; }
        else s = p/(2*Math.PI) * Math.asin (c/a);
        return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    },
    easeOutElastic: function (t, b, c, d) {
        var s=1.70158;var p=0;var a=c;
        if (t <= 0) return b;
        if (t >= d) return b + c;
        if ((t /= d) === 1) return b+c;  if (!p) p=d*0.3;
        if (a < Math.abs(c)) { a=c; s=p/4; }
        else s = p/(2*Math.PI) * Math.asin (c/a);
        return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
    },
    easeInOutElastic: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        var s=1.70158;var p=0;var a=c;
        if ((t /= d/2)==2) return b+c;  if (!p) p=d*(0.3*1.5);
        if (a < Math.abs(c)) { a=c; s=p/4; }
        else s = p/(2*Math.PI) * Math.asin (c/a);
        if (t < 1) return -0.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*0.5 + c + b;
    },
    easeInBack: function (t, b, c, d, s) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        if (s === undefined) s = 1.70158;
        return c*(t/=d)*t*((s+1)*t - s) + b;
    },
    easeOutBack: function (t, b, c, d, s) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        if (s === undefined) s = 1.70158;
        return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
    },
    easeInOutBack: function (t, b, c, d, s) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        if (s === undefined) s = 1.70158;
        if ((t /= d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
        return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
    },
    easeInBounce: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        return c - this.easeOutBounce(d-t, 0, c, d) + b;
    },
    easeOutBounce: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        if ((t/=d) < (1/2.75)) {
            return c*(7.5625*t*t) + b;
        } else if (t < (2/2.75)) {
            return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
        } else if (t < (2.5/2.75)) {
            return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
        } else {
            return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
        }
    },
    easeInOutBounce: function (t, b, c, d) {
        if (t <= 0) return b;
        if (t >= d) return b + c;
        if (t < d/2) return this.easeInBounce(t*2, 0, c, d) * 0.5 + b;
        return this.easeOutBounce(t*2-d, 0, c, d) * 0.5 + c*0.5 + b;
    },
    makeCubicBezierCurve: function (x1, y1, x2, y2) {
        var cubicBezierCurve = function(t){
            var cx = 3.0 * x1,
                bx = 3.0 * (x2 - x1) - cx,
                ax = 1.0 - cx - bx,
                cy = 3.0 * y1,
                by = 3.0 * (y2 - y1) - cy,
                ay = 1.0 - cy - by,
                sampleCurveX = function (t) {
                    return ((ax * t + bx) * t + cx) * t;
                },
                sampleCurveY = function (t) {
                    return ((ay * t + by) * t + cy) * t;
                },
                sampleCurveDerivativeX = function(t) {
                    return (3.0 * ax * t + 2.0 * bx) * t + cx;
                },
                solveCurveX = function(x,epsilon) {
                    var t0, t1, t2, x2, d2, i;
                    for (t2 = x, i = 0; i<8; i++) {
                        x2 = sampleCurveX(t2) - x;
                        if (Math.abs(x2) < epsilon) {
                            return t2;
                        }
                        d2 = sampleCurveDerivativeX(t2);
                        if(Math.abs(d2) < 1e-6) {
                            break;
                        }
                        t2 = t2 - x2 / d2;
                    }
                    t0 = 0.0;
                    t1 = 1.0;
                    t2 = x;
                    if (t2 < t0) {
                        return t0;
                    }
                    if (t2 > t1) {
                        return t1;
                    }
                    while (t0 < t1) {
                        x2 = sampleCurveX(t2);
                        if (Math.abs(x2 - x) < epsilon) {
                                return t2;
                        }
                        if (x > x2) {
                                t0 = t2;
                        } else {
                                t1 = t2;
                        }
                        t2 = (t1 - t0) * 0.5 + t0;
                    }
                    return t2; // Failure.
                };

            return sampleCurveY(solveCurveX(t, 1 / 200));
        };

        return function(t, b, c, d) {
            if (t <= 0) return b;
            if (t >= d) return b + c;
            return b + c * cubicBezierCurve(t / d);
        };
    }
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 *
 * Open source under the BSD License.
 *
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */