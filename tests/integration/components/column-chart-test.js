import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import crossfilter from 'crossfilter';

const getTestParameters = function () {
    const groupNames = ['fruits', 'citrus', 'oranges'];
    const rawData = [
        {
            date: new Date('2016-11-02'),
            fruits: 42,
            citrus: 20,
            oranges: 8
        },
        {
            date: new Date('2016-11-03'),
            fruits: 38,
            citrus: 33,
            oranges: 12
        },
        {
            date: new Date('2016-11-04'),
            fruits: 52,
            citrus: 52,
            oranges: 25
        }
    ];

    const crossfilterData = crossfilter(rawData);
    const dimensions = crossfilterData.dimension(d => d.date);
    const groups = groupNames.map(name => dimensions.group().reduceSum(item => item[name]));

    return {
        dimensions,
        groups,
        type: 'LAYERED',

        series: [
            {
                title: 'Total Fruit Eaten',
                hatch: 'pos'
            },
            {
                title: 'Citrus Fruit Eaten',
                hatch: 'neg'
            },
            {
                title: 'Oranges Eaten'
            }
        ],

        xAxis: {
            domain: [
                moment('2016-11-01'),
                moment('2016-11-05')
            ],
            ticks: 5
        },

        yAxis: {
            ticks: 3
        },

        comparisonLines: [{
            value: 15,
            displayValue: '15',
            color: '#2CD02C'
        }]
    };
};

module('Integration | Component | column chart', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.set('params', getTestParameters());
        this.owner.register('service:resizeDetector', Service.extend({
            setup(elementId, callback) {
                callback();
            },
            teardown() {}
        }));
    });

    test('it renders', async function (assert) {
        await render(hbs`{{column-chart}}`);
        assert.dom('.chart.column-chart').exists();
    });

    test('it renders correct number of x axis ticks', async function (assert) {
        await render(hbs`{{column-chart dimension=params.dimensions group=params.groups type=params.type series=params.series xAxis=params.xAxis yAxis=params.yAxis instantRun=true}}`);
        assert.dom('g.x.axis g.tick').exists({ count: 5 });
    });

    test('it renders correct number of y axis ticks', async function (assert) {
        await render(hbs`{{column-chart dimension=params.dimensions group=params.groups type=params.type series=params.series xAxis=params.xAxis yAxis=params.yAxis instantRun=true}}`);
        assert.dom('g.y.axis g.tick').exists({ count: 4 });
    });

    test('it renders a bar for each data point', async function (assert) {
        await render(hbs`{{column-chart dimension=params.dimensions group=params.groups type=params.type series=params.series xAxis=params.xAxis yAxis=params.yAxis instantRun=true}}`);
        assert.dom('g.sub._0 .chart-body rect.bar').exists({ count: 3 });
    });

    test('it shows chart not available', async function (assert) {
        await render(hbs`{{column-chart isChartAvailable=false xAxis=params.xAxis yAxis=params.yAxis instantRun=true}}`);
        assert.dom('.chart-not-available').exists();
    });

    test('it shows comparison lines', async function (assert) {
        await render(hbs`{{column-chart showComparisonLines=true comparisonLines=params.comparisonLines dimension=params.dimensions group=params.groups type=params.type series=params.series xAxis=params.xAxis yAxis=params.yAxis instantRun=true}}`);
        assert.dom('.comparison-line').exists({ count: 3 });
    });

    test('it renders minimum and maximum value indicators', async function (assert) {
        await render(hbs`{{column-chart seriesMaxMin=2 showMaxMin=true dimension=params.dimensions group=params.groups type=params.type series=params.series xAxis=params.xAxis yAxis=params.yAxis instantRun=true}}`);

        assert.dom('.max-value-text').exists();
        assert.dom('.max-value-indicator').exists();
        assert.dom('.min-value-text').exists();
        assert.dom('.min-value-indicator').exists();
    });

    test('it renders a legend with the correct number of boxes', async function (assert) {
        await render(hbs`{{column-chart dimension=params.dimensions group=params.groups seriesData=params.seriesData type=params.type series=params.series xAxis=params.xAxis yAxis=params.yAxis showLegend=true instantRun=true}}`);
        assert.dom('.legend-container > .legend-item').exists({ count: 3 });
    });

    test('it renders a legend even when there are no groups', async function (assert) {
        this.set('groups', []);
        await render(hbs`{{column-chart dimension=params.dimensions group=groups seriesData=params.seriesData type=params.type series=params.series xAxis=params.xAxis yAxis=params.yAxis showLegend=true instantRun=true}}`);
        assert.dom('.legend-container > .legend-item').exists({ count: 3 });
    });
});
