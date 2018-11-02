"use strict";
var ball = {
    config: {
        appearance: {
            width: 50,
            height: 50,
            background: 'red'
        },
        
        // Скорость движения мяча пиксель / 10 мс
        xBallSpeed: 15,
        yBallSpeed: 10,
        
        // Шаг сокращения пути
        xWayStep: 10,
        
        // Скорость остановки
        xBallStop: 0.01,
        yBallStop: 0.01,
        
        barrierObject: {
            width: 70,
            height: 70,
            background: 'green'
        }
    },
    xDirection: null,
    yDirection: null,
    isGravitation: false,
    sideTouch: function(coordObj) {
        function underTopLine() {
            if (coordObj.ballBottomOffset >= coordObj.barrierTopOffset && 
                coordObj.ballTopOffset < coordObj.barrierTopOffset) {
                    return true;
            }
            return false;
        }
        function aboveBottomLine() {
            if (coordObj.ballTopOffset <= coordObj.barrierBottomOffset && 
                coordObj.ballBottomOffset > coordObj.barrierBottomOffset) {
                    return true;
            }
            return false;
        }
        function behindLeftLine() {
            if (coordObj.ballRightOffset >= coordObj.barrierLeftOffset && 
                coordObj.ballLeftOffset < coordObj.barrierLeftOffset) {
                    return true;
            }
            return false;
        }
        function behindRightLine() {
            if (coordObj.ballLeftOffset <= coordObj.barrierRightOffset && 
                coordObj.ballRightOffset > coordObj.barrierRightOffset) {
                    return true;
            }
            return false;
        }
        
        if (underTopLine() && (behindLeftLine() || behindRightLine())) {
            return 'top';
        } else if (behindRightLine() && (underTopLine() || aboveBottomLine())) {
            return 'right';
        } else if (aboveBottomLine() && (behindLeftLine() || behindRightLine())) {
            return 'bottom';
        } else if (behindLeftLine() && (underTopLine() || aboveBottomLine())) {
            return 'left';
        }
        return 'ff';
    },
    kick: function(e) {
        var x = e.originalEvent.offsetX;
        var y = e.originalEvent.offsetY;
        this.xBallSpeed = this.config.xBallSpeed;
        this.yBallSpeed = this.config.yBallSpeed;
        this.isGravitation = false;
        
        // Левый верхний
        if (x < (this.config.appearance.width / 2) && y < (this.config.appearance.height / 2)) {
            this.xDirection = '+';
            this.yDirection = '+';
        }
        // Верхняя часть
        else if (x == (this.config.appearance.width / 2) && y < (this.config.appearance.height / 2)) {
            this.yDirection = '+';
        }
        // Правый верхний
        else if (x > (this.config.appearance.width / 2) && y < (this.config.appearance.height / 2)) {
            this.xDirection = '-';
            this.yDirection = '+';
        }
        // Правая часть
        else if (x > (this.config.appearance.width / 2) && y == (this.config.appearance.height / 2)) {
            this.xDirection = '-';
        }
        // Нижний правый
        else if (x > (this.config.appearance.width / 2) && y > (this.config.appearance.height / 2)) {
            this.xDirection = '-';
            this.yDirection = '-';
        }
        // Нижняя часть
        else if (x == (this.config.appearance.width / 2) && y > (this.config.appearance.height / 2)) {
            this.yDirection = '-';
        }
        // Нижний левый
        else if (x < (this.config.appearance.width / 2) && y > (this.config.appearance.height / 2)) {
            this.xDirection = '+';
            this.yDirection = '-';
        }
        // Левая часть
        else if (x < (this.config.appearance.width / 2) && y == (this.config.appearance.height / 2)) {
            this.xDirection = '+';
        }
        return this;
    },
    move: function(ballEl, barrierEl) {
        var self = this;
        
        var ballLeftOffset = $(ballEl).offset().left;
        var ballRightOffset = $(ballEl).offset().left + self.config.appearance.width;
        var ballTopOffset = $(ballEl).offset().top;
        var ballBottomOffset = $(ballEl).offset().top + self.config.appearance.height;
        
        var barrierLeftOffset = barrierEl.offset().left;
        var barrierRightOffset = barrierEl.offset().left + barrierEl.width();
        var barrierTopOffset = barrierEl.offset().top;
        var barrierBottomOffset = barrierEl.offset().top + barrierEl.height();
        
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();
        
        var coordObj = {
            ballLeftOffset: ballLeftOffset,
            ballRightOffset: ballRightOffset,
            ballTopOffset: ballTopOffset,
            ballBottomOffset: ballBottomOffset,
            barrierLeftOffset: barrierLeftOffset,
            barrierRightOffset: barrierRightOffset,
            barrierTopOffset:  barrierTopOffset,
            barrierBottomOffset: barrierBottomOffset
        }
        
        // Определить направление по оси X
        if ((self.xDirection == '+' && windowWidth - ballLeftOffset <= self.config.appearance.width) ||
            (self.xDirection == '+' && self.sideTouch(coordObj) === 'right')) {
            self.xDirection = '-';
        } else if ((self.xDirection == '-' && windowWidth - ballLeftOffset >= windowWidth) ||
                    (self.xDirection == '-' && self.sideTouch(coordObj) === 'left')) {
            self.xDirection = '+';
        }
        
        // Определить направление по оси Y
        if ((self.yDirection == '+' && windowHeight - ballTopOffset <= self.config.appearance.height) ||
            (self.yDirection == '+' && self.sideTouch(coordObj) === 'top')) {
            self.yDirection = '-';
            
            // Мячик отскакивает вверх - сбавляем скорость
            self.yBallSpeed = self.yBallSpeed - (self.config.yBallStop * 3);
        } else if ((self.yDirection == '-' && windowHeight - ballTopOffset >= windowHeight) ||
                   (self.yDirection == '-' && self.sideTouch(coordObj) === 'bottom')) {
            self.yDirection = '+';
        }
        $(ballEl).animate(
            {
                left: self.xDirection + '=' + self.xBallSpeed,
                top: self.yDirection + '=' + self.yBallSpeed
            }, 
            {
                duration: 10,
                queue: false,
                complete: function () {
                    if (self.xBallSpeed > 0) {
                        self.xBallSpeed = self.xBallSpeed - self.config.xBallStop;
                    } else {
                        self.xBallSpeed = 0;
                    }
                    if (self.yBallSpeed > 0 && !self.isGravitation) {
                        self.yBallSpeed = self.yBallSpeed - self.config.yBallStop;
                    } else {
                        self.isGravitation = true;
                        // Если скорость упала до нуля, то мяч падает вниз, если есть куда падать
                        if ((windowHeight - ballTopOffset - self.config.appearance.height) > 0) {
                            self.yDirection = '+';
                            self.yBallSpeed = self.yBallSpeed + self.config.yBallStop;
                        } else {
                            $(ballEl).css({
                                'top': 'auto',
                                'bottom': 0
                            });
                            self.yBallSpeed = 0;
                        }
                    }
                    if (self.xBallSpeed === 0 && self.yBallSpeed === 0) {
                        return;
                    }
                    self.move(ballEl, barrierEl);
                }
            }
        );
    }
}
var obj = $('#object').css(ball.config.barrierObject);
$('#ball').css(ball.config.appearance).click(
    function(e) {
        ball.kick(e).move(e.currentTarget, obj);
    }
);