// from: http://stackoverflow.com/questions/442404/dynamically-retrieve-html-element-x-y-position-with-javascript
function getElementOffset(el) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.parentNode;
    }
    return { clientX: _x, clientY: _y };
}
class Controls {
    constructor(id) {
        this.id = id;
        this.el = document.getElementById(id);
        this.controls = [];
        //this.activeTouches = [];

        // this.el.addEventListener('pointerdown', (e) => {
        // });
        // this.el.addEventListener('pointerup', (e) => {
        // });
        // this.el.addEventListener('pointermove', (e) => {
        // });

        this.el.addEventListener('touchstart', (e) => {
            //console.log('touchstart');
            e.preventDefault();
            e.returnValue = false; // this is marked deprecated on Mobile Safari -- but! cannout turn off magifier selection thing (easy repro of bug is to tap double-tap and hold)
            // with this line commented out, the magifier selection stays broken
            for(let i = 0; i < e.changedTouches.length; i++) {
                this._processTouchStart(e.changedTouches.item(i));
            }
        }, { passive: false });
        this.el.addEventListener('touchend', (e) => {
            //let touch = e.touches[0];
            //console.log('touchend');
            for(let i = 0; i < e.changedTouches.length; i++) {
                this._processTouchEnd(e.changedTouches.item(i));
            }
        }, { passive: false });
        this.el.addEventListener('touchmove', (e) => {
            //let touch = e.touches[0];
            //console.log('touchmove');
            for(let i = 0; i < e.changedTouches.length; i++) {
                this._processTouchMove(e.changedTouches.item(i));
            }
        }, { passive: false });
        this.el.addEventListener('touchcancel', (e) => {
            //let touch = e.touches[0];
            //console.log('touchcancel');
            for(let i = 0; i < e.changedTouches.length; i++) {
                this._processTouchEnd(e.changedTouches.item(i));
            }
        }, { passive: false });
    }

    _trackTouch(touch, control) {
        if(control.isDown) {
            throw new Error('Control already down');
        }
        control.isDown = true;
        control.activeTouch = touch;
        control.onDown();
    }

    _releaseTouch(touch, control) {
        if(!control.isDown) {
            throw new Error('Control should be down already');
        }
        control.isDown = false;
        // this.activeTouches = this.activeTouches.filter((t) => t.identity !== touch.identity);
        control.activeTouch = null;
        control.onUp();
    }

    _getTouchRelativePosition(touch) {
        // console.log(touch);
        let rect = this.el.getBoundingClientRect();
        // console.log('RECT:', rect);
        // let offset = getElementOffset(this.el);
        // console.log('OFFSET:', offset);
        //console.log(touch.clientX, touch.clientY);
        //console.log(offset.clientX, offset.clientY);
        let x = touch.clientX - rect.x;
        let y = touch.clientY - rect.y;
        // console.log('X Y:', x, y);
        let rx = x / rect.width;
        let ry = y / rect.height;
        // console.log('RX RY:', rx, ry);
        return { rx, ry };
    }

    _status() {
        this.controls.forEach((control) => {
            if(control.isDown) {
                // console.log('CURRENTLY DOWN:', control.str);
            }
        });
    }

    _processTouchStart(touch) {
        //this.activeTouches.push(touch);
        let pos = this._getTouchRelativePosition(touch);
        let that = this;
        this.controls.forEach((control) => {
            let dx = pos.rx - control.cx;
            let dy = pos.ry - control.cy;
            // console.log('Control:', control.str, 'DX DY:', dx, dy);
            let dist2 = dx * dx + dy * dy;
            let inside = dist2 < control.cr * control.cr;
            if(inside) {
                // console.log('DOWN INSIDE:', control.str);
                that._trackTouch(touch, control);
            }
        });
        this._status();
    }

    _processTouchMove(touch) {
        let pos = this._getTouchRelativePosition(touch);
        let that = this;
        this.controls.forEach((control) => {
            let dx = pos.rx - control.cx;
            let dy = pos.ry - control.cy;
            let dist2 = dx * dx + dy * dy;
            let inside = dist2 < control.cr * control.cr;
            let changed = inside !== control.isDown;
            if(changed && control.isDown) {
                // console.log('CHANGED:', control.str);
                that._releaseTouch(touch, control);
            }
            else if(changed && !control.isDown) {
                // console.log('CHANGED:', control.str);
                that._trackTouch(touch, control);
            }
        });
        this._status();
    }

    _processTouchEnd(touch) {
        let pos = this._getTouchRelativePosition(touch);
        let that = this;
        this.controls.forEach((control) => {
            let dx = pos.rx - control.cx;
            let dy = pos.ry - control.cy;
            let dist2 = dx * dx + dy * dy;
            let inside = dist2 < control.cr * control.cr;
            if(inside) {
                // console.log('UP INSIDE:', control.str);
                that._releaseTouch(touch, control);
            }
        });
        this._status();
    }

    addControl(str, cx, cy, cr, onDown, onUp) {
        this.controls.push({str, cx, cy, cr, onDown, onUp, isDown: false, activeTouch: null});
    }
}
