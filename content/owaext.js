(function () {

console.log('OWA Notifier enabled');

// ---------------------
// Favicon
// ---------------------
function Favicon() {
    var that = this;
    this._highlight = false;
    this._loaded = false;

    this.original = new Image();
    this.original.src = document.querySelector("link[rel*='icon']").href;
    this.original.addEventListener('load', function() {
        that._loaded = true;

        that.icon = document.createElement('link');
        that.icon.rel = 'shortcut icon';
        that.icon.type = 'image/png';
        document.body.appendChild(that.icon);

        that.render();
    });
    return this;
}
Favicon.prototype.render = function () {
    var canvas; 
    var ctx;
    var radius = 0.25 * this.original.width;

    if (this._loaded) {
        canvas = document.createElement("canvas");
        canvas.width = this.original.width;
        canvas.height = this.original.height;

        ctx = canvas.getContext("2d");
        ctx.drawImage(this.original, 0, 0)

        if (this._highlight) {
            ctx.beginPath();
            ctx.arc(this.original.width-radius, this.original.height-radius, radius, 0, 2*Math.PI);
            ctx.fillStyle = "#cc0000";
            ctx.fill();
        }

        this.icon.href = canvas.toDataURL("image/png");
    }
};
Favicon.prototype.highlight = function (on) {
    this._highlight = on;
    this.render();
};

// ---------------------
// State
// ---------------------
function State(data) {
    this.data = data;
    return this;
}
State.prototype.has = function (type) {
    return this.data[type] > 0;
};
State.prototype.equals = function (state) {
    for (p in state.data) {        
        if (this.data.hasOwnProperty(p) && this.data[p] != state.data[p]) {
            return false;
        }
    }
    return true;
};

// ---------------------
// Helpers
// ---------------------
function getVisibleElement(elements) {
    return Array.from(elements)
        .filter(el => el.offsetWidth > 0 && el.offsetHeight > 0)
        .reduce((a, b) => b, undefined);
}

function checkNotificationButton(notificationType) {
    var el = getVisibleElement(document.querySelectorAll('.wf-owa-' + notificationType + '-notification-white'));
    if (!el) {
        el = getVisibleElement(document.querySelectorAll('.wf-owa-' + notificationType + '-notification'));
    }
    if (el) {
        el = el.parentNode; // <button>
        return Array.from(el.childNodes)
            .filter(c => /^[0-9]+$/.test(c.textContent))
            .map(c => getVisibleElement(c) ? c.textContent : 1)
            .reduce((a, b) => a+b);
    }
    return 0;
}

function checkO365NotificationPanel() {
    var el = document.querySelectorAll('#NotificationsFlexPaneScrollRegion .o365cs-notifications-notificationLabel .o365cs-notifications-notificationHeaderText');
    if (el) {
        return Array.from(el)
            .map(e => /\(([0-9]+)\)/.exec(e.textContent))
            .filter(a => a != null)
            .map(a => parseInt(a[1]))
            .reduce((a, b) => a+b, 0);
    }
    return 0;
}

// ---------------------
// Main
// ---------------------
var favicon = new Favicon();
var currentState = new State({
    mails: 0,
    events: 0,
    notifications: 0
});

setInterval(function () {

    try {
        var state = new State({
            mails: checkNotificationButton('mail'),
            events: checkNotificationButton('event'),
            notifications: checkO365NotificationPanel()
        });
    } catch (e) {
        console.error(e);
    }

    if (!state.equals(currentState)) {
        currentState = state;

        var message = '';
        if (state.has('mails')) {
            message += "Neue E-Mail(s)\n";
        }
        if (state.has('events')) {
            message += state.data.events + " Erinnerung(en)\n";
        }
        if (state.has('notifications')) {
            message += state.data.notifications + " Benachrichtigung(en)\n";
        }

        if (message != '') {
            favicon.highlight(true);
            Notification.requestPermission(function (permission) {
                if (Notification.permission === "granted") {
                    new Notification('Outlook Web Access', {body: message});
                }
            });
        } else {
            favicon.highlight(false);            
        }
    }

}, 2000);

}());