define(["jquery", "backbone", "highcharts", "oakland-mayor-summary/config"], function($, Backbone, Highcharts, config) {

  return Backbone.View.extend({
    tagName: "div",

    initialize: function(opts) {

      this.$el.css({
        float: 'left'
      });

      this.highchartDiv = document.createElement('div');
      this.$el.append(this.highchartDiv);
      this.render();
    },

    /**
     * Highlights all the waterfall components of a given name by turning all the others grey
     */
    highlightComponent: function(componentName) {
      this.highchart.series[0].data.forEach(function(point) {
        point.update({
          color: point.name === componentName ? point.origColor : '#AAA'
        }, false, false);
      });
      this.highchart.redraw(false);
    },

    unhighlightComponent: function() {
      this.highchart.series[0].data.forEach(function(point) {
        point.update({
          color: point.origColor
        }, false, false);
      });
      this.highchart.redraw(false);
    },

    render: function() {
      var components = this.options.data.data;

      var waterfallData = [
        // Everyone started with 0, don't show
        // {
          // name: 'Beginning Cash',
          // y: components.beginCash
        // },

        {
          name: 'Contributions',
          y: components.monetaryContrib
        },
        {
          name: 'Loans Received',
          y: components.loansRec
        },

        // Everyone has 0 for misc. increases, don't show
        // {
          // name: 'Misc. Increases to Cash',
          // y: components.miscInc
        // },

        // {
          // name: 'Total Cash Raised',
          // isIntermediateSum: true,
          // color: Highcharts.getOptions().colors[1]
        // },

        {
          name: 'Expenditures',
          y: components.expenditures
        },

        // Everyone has 0, don't show
        // {
          // name: 'Loans Made',
          // y: components.loansMade
        // },

        {
          name: 'Cash On Hand',
          isIntermediateSum: true,
          color: Highcharts.getOptions().colors[1]
        },

        {
          name: 'Unpaid Bills',
          y: components.accruedExpenses
        },

        {
          name: 'Non-monetary Contributions',
          y: components.nonmonetaryContr
        },

        {
          name: 'Effective Balance',
          isSum: true,
          color: Highcharts.getOptions().colors[1]
        },
      ];

      // We want to support highlighting different components.  This will be done with Point.update() calls, changing
      // the Point's color property.  However, we need to first save the original color so we can dig it back up on the
      // unhighlight
      waterfallData.forEach(function(datum) {
        if (!datum.color) {
          datum.color = datum.isIntermediateSum || datum.isSum ?
                          config.SUM_COLOR :
                          (datum.y > 0 ? config.UP_COLOR : config.DOWN_COLOR);
        }
        datum.origColor = datum.color;
      });

      this.highchart = new Highcharts.Chart({
        chart: {
          renderTo: this.highchartDiv,
          type: 'waterfall',
          width: 300,
          height: 300,
          marginLeft: 60
        },

        title: {
          text: this.options.data.candidate
        },

        xAxis: {
          type: 'category',
          labels: {
            rotation: 360-45
          }
        },

        yAxis: {
          title: {
            text: ''
          },
          labels: {
            formatter: function () {
              return '$ ' + (
                this.value === 0 ?
                  0 :
                  Highcharts.numberFormat(this.value / 1000, 0, ',') + 'k'
              );
            }
          },
          max: 210000,     // Make the limit a bit above 200k so nice grid spacing and so the 'Total Raised' label
          endOnTick: false // has room to appear above the top-most bar
        },

        tooltip: {
          pointFormat: '<b>${point.y:,.2f}</b>'
        },

        legend: {
          enabled: false
        },

        exporting: { enabled: false },
        credits: {enabled: false},

        series: [{
          upColor: config.UP_COLOR,
          color: config.DOWN_COLOR,

          dataLabels: {
            enabled: true,
            formatter: function () {
              if (this.key !== 'Loans Received') {
                return '';
              }

              var totalRaised = components.monetaryContrib + components.loansRec;

              return 'Total Raised: $ ' +
                     (totalRaised > 1000 ?
                        Highcharts.numberFormat(totalRaised / 1000, 0, ',') + 'k' :
                        totalRaised);

            },
            inside: false,
            align: 'center',
            style: {
                // color: '#FFFFFF',
                // fontWeight: 'bold',
                // textShadow: '0px 0px 3px black'
            }
          },

          data: waterfallData
        }]
      });
    }
  });
});