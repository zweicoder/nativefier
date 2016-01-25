var Handler = {
    attach: function (document) {
        console.log('Handler attached!');
        // Open emoji panel
        document.querySelector('#main > footer > div > button').click();

        this.coords = {
            x: 0,
            y: 0
        };
        this.targetIndex = 0;
        this.lastIndex = 0;

        // Emoji dimensions are 45 x 45
        this.emojiDim = 45;
        var grandParent = document.querySelector('#main > footer > span > div > span > div');
        this.bounds = {
            x: Math.floor(grandParent.clientWidth / this.emojiDim) - 1, // -1 to make it zero indexed
            y: Math.floor(grandParent.clientHeight / this.emojiDim) - 1
        };

        this.highlightSelected();

        this.initialized = true;
    },
    highlightSelected: function () {
        console.log('Target Index: ', this.targetIndex);
        console.log('Coords: ' + this.coords.x + ' , ' + this.coords.y);
        var par = document.querySelector('#main > footer > span > div > span > div > div');

        var oldTarget = par.childNodes[this.lastIndex];
        oldTarget.style.border = '';

        var target = par.childNodes[this.targetIndex];
        var borderCss = '2px solid #9ecaed';
        target.style.border = borderCss;

        this.lastIndex = this.targetIndex;
    },
    detach: function (doc) {
        // Close emoji panel
        doc.querySelector('#main > footer > div > button').click();
        this.initialized = false;
    },
    handle: function (doc, e) {
        if (e.keyCode === 38 && e.ctrlKey && !this.initialized) {
            this.attach(doc)
        }

        if (this.initialized) {
            var par = document.querySelector('#main > footer > span > div > span > div > div');
            if (e.keyCode === 27 || (e.keyCode === 40 && e.ctrlKey)) {
                // on escape, detach
                this.detach(doc);
                return;
            }
            if (e.keyCode === 13) {
                // on Escape or enter, close panel and detach
                par.childNodes[this.targetIndex].click();
                this.detach(doc);
                return;
            }
            else if (e.keyCode === 37) {
                // Left
                if (this.coords.x === 0) {
                    this.coords.x = this.bounds.x;
                    // Track index in list as the real coordinates (after taking into account scroll)
                    this.targetIndex += this.bounds.x
                }
                else {
                    this.coords.x -= 1;
                    this.targetIndex -= 1;
                }
            }
            else if (e.keyCode === 39) {
                // Right
                //TODO ctrl key to switch emoji tabs
                if (this.coords.x === this.bounds.x) {
                    this.coords.x = 0;
                    this.targetIndex -= this.bounds.x
                }
                else {
                    this.coords.x += 1;
                    this.targetIndex += 1;
                }
            }
            else if (e.keyCode === 38) {
                // Up
                if (this.coords.y === 0) {
                    var grandParent = document.querySelector('#main > footer > span > div > span > div');
                    if (grandParent.scrollTop < 45) {
                        grandParent.scrollTop = 0;
                    } else {
                        grandParent.scrollTop -= 45;
                        this.targetIndex -= this.bounds.x + 1;
                    }
                }
                else {
                    this.targetIndex -= this.bounds.x + 1;
                    this.coords.y -= 1;
                }
            }
            else if (e.keyCode === 40) {
                // Down
                if (this.coords.y === this.bounds.y) {
                    var grandParent = document.querySelector('#main > footer > span > div > span > div');
                    grandParent.scrollTop += this.emojiDim;
                    // Not sure how to find out how far we can scroll to. KIV
                } else {
                    this.coords.y += 1;
                }
                this.targetIndex += this.bounds.x + 1;
            }

            this.highlightSelected();

        }
    }
};

function bindKeyListener(doc, e) {
    // nest functions and bind here
    // handleKey if ctrl + up pressed
    var fn = Handler.handle.bind(Handler, doc);
    var existingListener = doc.onkeydown;
    doc.onkeydown = function (ev) {
        if (existingListener) {
            existingListener(e);
        }
        fn(ev);
    }
}

module.exports = bindKeyListener;
