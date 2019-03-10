/*
 * Basic responsive mashup template
 * @owner Enter you name here (xxx)
 */
/*
 *    Fill in host and port for Qlik engine
 */
var prefix = window.location.pathname.substr( 0, window.location.pathname.toLowerCase().lastIndexOf( "/extensions" ) + 1 );
var ChartType = "barchart";

var config = {
	host: 'localhost',
	prefix: '/session/',
	port: '80',
	isSecure: false
};
require.config( {
	baseUrl: ( config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "") + config.prefix + "resources"
} );

var app;
require( ["js/qlik"], function ( qlik ) {
	qlik.setOnError( function ( error ) {
		$( '#popupText' ).append( error.message + "<br>" );
		$( '#popup' ).fadeIn( 1000 );
	} );
	$( "#closePopup" ).click( function () {
		$( '#popup' ).hide();
	} );

	
	//open apps -- inserted here --	
	this.app = qlik.openApp('aa72ba66-9cb1-469d-af42-2a71d485550f', config);			// Test
		
	this.app.getObject('chart1','krWxx');
	this.app.getObject('chart2','KYSaNka');
	
	//create cubes and lists -- inserted here --

	$("#ClearAll").click(function() {
		app.clearAll();		
	});

	$('.dropdown-item-type').click(function() {
		var lbl = $(this).text();
		ChartType = $(this).attr("value");
		$('.chartchange').text(lbl);
		DrawChart();
	});	

	app.visualization.create('barchart',[],
    {
 
        qHyperCubeDef: {
            qDimensions: [
             {
                 qDef: {
                     qFieldDefs: [
                      "Category"
                     ]
                 }
             }
            ],
            qMeasures: [
             {
                 qDef: {
                     qDef: "Sum([Sales])",
                     qLabel: "Total Sales",
                 }                 
             }
            ],
            qInitialDataFetch: [
             {
                 qHeight: 12,
                 qWidth: 2
             }
            ]
        },
 
        "title": "Dynamically Generated Barchart",        
        "color": { "auto": false, "mode": "byDimension" }
      	// "color": { "auto": false, "mode": "byMeasure" }
 
    })
    .then(function(vis){
        vis.show("chart3");
	});	

} );

function DrawChart() {
 
	var hcube = {
		qHyperCubeDef: {
			qDimensions: [{
				qDef: {
					qFieldDefs: [
						"Category"
					]
				}
			}],
			qMeasures: [{
					qDef: {
						qDef: "Sum([Sales])",
						qLabel: "Total Sales",
					}				 
				}
 
			],
			qInitialDataFetch: [{
				qHeight: 12,
				qWidth: 2
			}]
		},
 
		"title": "Dynamically Generate Chart with User Input",
		"color": {
			"auto": false,
			"mode": "byDimension"
		}		
	};
 
	app.visualization.create(ChartType, [], hcube)
		.then(function(vis) {
			vis.show("chart4");
		});
}