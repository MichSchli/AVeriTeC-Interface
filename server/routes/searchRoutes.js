const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');

// A route that calls our python search script
router.post('/', async (req, res) => {
    try {
        const { query, date, country_code, page, annotation_request } = req.body;
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
        } else {
            pyProg = spawn(python_exc, ['utils/web_search.py',
                '--query', query,
                '--page', page,
                '--country_code', country_code
            ]);
        }
        
        // Collect data from script
        let dataString = '';
        pyProg.stdout.on('data', function (data) {
            dataString += data.toString();
        });

        // Send data to client
        pyProg.stdout.on('end', function () {
            return res.status(200).json({ message: 'Success', data: JSON.parse(dataString) });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
