Edgecase = new JS.Module('Edgecase', {
    include: JS.Observable,
    
    _visible: true,
    
    setElement: function(element) {
        this._element = jQuery(element);
        
        return this;
    },
    
    setContainer: function(container) {
        this._container = container ? jQuery(container) : null;
        
        return this;
    },
    
    setAspectRatio: function(ratio) {
        this._aspectRatio = ratio;
        
        if (this._element) this.fitToContainer();
        
        return this;
    },
    
    getAspectRatio: function() {
        return this._aspectRatio;
    },
    
    setup: function() {
        var self = this;
        
        jQuery(window).bind('resize', function() {
            if (self._visible) {
                self.fitToContainer();
            }
        });
        
        this.fitToContainer();
        this.notifyObservers('load', this);
        
        return this;
    },
    
    show: function() {
        if (this._visible) return this;
        
        this.fitToContainer();
        this._element.show();
        
        this._visible = true;
        
        this.notifyObservers('show', this);
        
        return this;
    },
    
    hide: function() {
        if (!this._visible) return this;
        
        this._element.hide();
        
        this._visible = false;
        
        this.notifyObservers('hide', this);
        
        return this;
    },
    
    getHTML: function() {
        return this._element;
    },
    
    fitToContainer: function() {
        if (this._container) {
            // TODO Possibly change to outerWidth/outerHeight
            this.fitToContainerXY(this._container.width(), this._container.height());
        } else {
            this.fitToViewport();
        }
        
        return this;
    },
    
    fitToViewport: function() {
        var win            = jQuery(window),
            viewportWidth  = win.width(),
            viewportHeight = win.height();
        
        this.fitToContainerXY(viewportWidth, viewportHeight);
        
        return this;
    },
    
    fitToContainerXY: function(containerWidth, containerHeight) {
        var containerAspectRatio = containerWidth / containerHeight,
            style = {display: 'block', position: 'absolute'},
            x, y;
        
        if (containerAspectRatio > this.getAspectRatio()) {
            y = containerWidth / this.getAspectRatio();
            
            style.width  = containerWidth + 'px';
            style.height = Math.ceil(y) + 'px';
            style.left   = 0;
            style.top    = Math.ceil((containerHeight - y) / 2) + 'px';
        } else {
            x = containerHeight * this.getAspectRatio();
            
            style.width  = Math.ceil(x) + 'px';
            style.height = containerHeight + 'px';
            style.left   = Math.ceil((containerWidth - x) / 2) + 'px';
            style.top    = 0;
        }
        
        this._element.css(style);
    }
});

/**
 * The following two methods are ported from the Ojay.Observable module, since
 * the JS.Observable module from JS.Class does not have a sufficiently rich API
 * to allow our jQuery port of Edgecase to mimic the original in this respect
 * without these enhancements.
 */
Edgecase.include({
    on: function(eventName, callback, scope) {
        var chain = new JS.MethodChain;
        if (callback && typeof callback != 'function') scope = callback;
        this.addObserver(function() {
            var args = Array.prototype.slice.apply(arguments), message = args.shift();
            if (message != eventName) return;
            if (typeof callback == 'function') callback.apply(scope || null, args);
            chain.fire(scope || args[0]);
        }, this);
        return chain;
    },
    
    notifyObservers: function() {
        var args = Array.prototype.slice.apply(arguments),
            receiver = (args[1]||{}).receiver || this;
        
        if (receiver == this) args.splice(1, 0, receiver);
        else args[1] = receiver;
        
        this.callSuper.apply(this, args);
        
        args[1] = {receiver: receiver};
        var classes = this.klass.ancestors(), klass;
        while ((klass = classes.pop()))
            klass.notifyObservers && klass.notifyObservers.apply(klass, args);
        
        return this;
    }
});

Edgecase.Concrete = new JS.Class('Edgecase.Concrete', {
    include: Edgecase,
    
    initialize: function(image, options) {
        var ratio, html, x, y;
        
        options = options || {};
        
        this.setElement(image);
        this.setContainer(options.container);
        this.getHTML().css('display', 'block');
        
        if (options.aspectRatio) {
            ratio = options.aspectRatio;
        } else {
            html  = this.getHTML();
            // TODO Possibly change to outerWidth/outerHeight
            x     = html.width();
            y     = html.height();
            ratio = x / y;
        }
        
        this.setAspectRatio(ratio);
    }
});
