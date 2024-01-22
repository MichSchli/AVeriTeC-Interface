const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const P2AnnotationRequestModel = require('../model/annotationRequests/p2AnnotationRequestModel');
const P4AnnotationRequestModel = require('../model/annotationRequests/p4AnnotationRequestModel');
const TrainingP2AnnotationRequestModel = require('../model/annotationRequests/trainingP2AnnotationRequestModel');
const SearchRecordModel = require('../model/searchRecordModel');

// A route that calls our python search script
router.post('/', async (req, res) => {
    try {
        const { query, date, country_code, page, annotation_request, phase, dataset } = req.body;
        if (!query) {
            return res.status(400).json({ message: 'Query is missing' });
        }

        console.log("Searching: " + query)

        // Call the python script. Give query, page, date, and country_code as arguments.
        // They are all named arguments.
        // Format date from ie 2020-11-18T00:00:00.000Z to dd/mm/yyyy, or if undefined don't give it as an argument
        const python_exc = "/Users/michaelschlichtkrull/anaconda3/envs/AveritecBaseline/bin/python"
        var date_string = ""
        var pyProg;
        if (date) {
            date_string = date.substring(8, 10) + "/" + date.substring(5, 7) + "/" + date.substring(0, 4)
            pyProg = spawn(python_exc, ['utils/web_search.py',
                '--query', query,
                '--page', page,
                '--date', date_string,
                '--country_code', country_code
            ]);
            console.log("Executing search query with command: " + python_exc + " utils/web_search.py --query " + query + " --page " + page + " --date " + date_string + " --country_code " + country_code)
        } else {
            pyProg = spawn(python_exc, ['utils/web_search.py',
                '--query', query,
                '--page', page,
                '--country_code', country_code
            ]);
            console.log("Executing search query with command: " + python_exc + " utils/web_search.py --query " + query + " --page " + page + " --country_code " + country_code)
        }

        // Collect data from script
        let dataString = '';
        pyProg.stdout.on('data', function (data) {
            dataString += data.toString();
        });
        pyProg.stderr.on('data', (results) => {
            console.log('Error: %j', results)
        });

        pyProg.on('close', async (code) => {

            var search_results = JSON.parse(dataString)

            // Create search record
            var searchRecord = {
                query: query,
                p2_annotation_request: phase == 2 && dataset != "training" ? annotation_request._id : null,
                p4_annotation_request: phase == 4 ? annotation_request._id : null,
                training_p2_annotation_request: phase == 2 && dataset == "training" ? annotation_request._id : null,
                page: page,
                result_urls: search_results.map((result) => result.link),
                timestamp: Date.now(),
                location_ISO_code: country_code,
                cutoff_timestamp: date ? date : null
            };

            // Save search record
            var searchRecord = await SearchRecordModel.create(searchRecord);
            console.log("Successfully inserted search record for \"" + searchRecord.query + "\" into database")

            // Send data to client
            return res.status(200).json({ message: 'Success', data: JSON.parse(dataString) });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
