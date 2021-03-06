'use strict';

/**
 * @ngdoc directive
 * @name verpApp.directive:brush
 * @description
 * # brush
 */
angular.module('verpApp')
    .directive('brush', function () {

        var postLink = function postLink(scope, element, attrs) {

            var w = +attrs.width,
                h = +attrs.height,
                f = attrs.flipy,
                x = d3.scale.linear().range([0,w]),
                y = d3.scale.linear().range([0,h]),
                brush = d3.svg.brush(),
                brushsvg = d3.select(element[0])
                    .append('svg')
                    .attr('width', w)
                    .attr('height', h)
                    .append('g')
                    .attr("class", "rectbrush"),
                sgny=-1;

            if(f === 'true') {
                y.range([h, 0]);
                sgny = 1
            }


            d3.select(element[0])
                .on('mouseover', function(){d3.select(this).node().focus();})
                .on('keydown', handleKeydown);


            function init(){
                var dom = scope.domain();
                brush.x(x.domain(dom.dx))
                     .y(y.domain(dom.dy))
                     .on('brush', brushed);
                brushsvg.call(brush);
            }

            function updateScale(e, d){

                x.domain(d.xs().domain()).range(d.xs().range());
                y.domain(d.ys().domain()).range(d.ys().range());

            }

            function brushed(){
                var e = (brush.empty()) ? false : brush.extent();
                scope.broadcastEvent('view.brush', e);
            }


            function left(e,step){
                e[0][0] -= step;
                e[1][0] -= step;
            }

            function right(e,step){
                e[0][0] += step;
                e[1][0] += step;
            }

            //in screen coords of y
            function up(e, step){
                e[0][1] += (sgny*step);
                e[1][1] += (sgny*step);
            }


            function down(e,step){
                e[0][1] -= (sgny*step);
                e[1][1] -= (sgny*step);
            }


            function handleKeydown(){
                var key = d3.event.keyCode, meta = d3.event.metaKey, step = 1;

                if(key >= 37 && key <= 40) { //up and down arrow
                    if(brush.empty()) return;

                    d3.event.preventDefault();

                    var e = brush.extent();

                    if(meta) {//diagonal moves
                        if (key === 37) {
                            left(e,step);
                            down(e,step);
                        } else if (key === 39) {
                            right(e,step);
                            up(e,step);
                        } else if (key === 38) {
                            up(e,step);
                            left(e,step);
                        } else {
                            down(e,step);
                            right(e,step);
                        }
                    }else{

                        if (key === 37) { //left
                            left(e,step);
                        } else if (key === 39) { //right
                            right(e,step);
                        } else if (key === 38) { //down
                            up(e,step);
                        } else {
                            down(e,step);
                        }
                    }

                    brushsvg.call(brush.extent(e)).call(brush.event);
                }

            }

            scope.$on('domain.ready', init);
            scope.$on('view.zoom', updateScale);

        };

        return {
            template: '<div tabindex="0"></div>',
            restrict: 'E',
            replace:true,
            link: postLink
        };

    });
