// Add to Dockerfile: npm install read-excel-file

// https://www.npmjs.com/package/read-excel-file
const readXlsxFile = require('read-excel-file/node');
var fs = require('fs');

const BASE_URL_SD = "http://jpsys.com/StructureDefinition/";
const BASE_URL_VS = "http://jpsys.com/ValueSet/";
var filesds = { };
var valuesets = [ ];

// Map columns of the template 'Model' sheet to a js-struct
const map = {
    'ID': 'id',
    'file#': 'file',
    'filename': 'filename',
    'field#': 'field',
    'name': 'fieldname',
    'type': 'type',
    '': 'details'
    }

// Copy/paste this from vista-dox website; not in vista-dox xlsx 
const filedesc = {
    "2": "#2 The PATIENT file contains all the patients followed by the medical center/ Outpatient clinic. At a minimum each patient entry must have a NAME, DATE OF BIRTH and SOCIAL SECURITY NUMBER. In order to add a new patient to the PATIENT file the user must also indicate whether or not the patient is requesting to receive care as a VETERAN of the U.S. Armed Forces and specify the TYPE of patient being added to the system. For the most part the information contained in this file is demographic in nature, i.e., address, employment, service history, etc., however data concerning admissions, appointments,etc., is also stored in this file. The ADMISSION sub-field is scheduled to be moved into the new PATIENT MOVEMENT file by the end of calendar year 1989. Care should be used when removing a patient from the PATIENT file since virtually all other DHCP modules do utilize data from this file. Of the many fields in the file you will note that many are preceeded by an asterisk. Those fields are scheduled to be removed from the file due to either lack of use or replacement by another field/file in the next release.",
    "4": "#4 This file contains a listing of VA institutions. It is cross-referenced by name and station number. The Number field is no longer meaningful (it had previously referenced the station number).",
    "5": "#5 This file contains the name of the state (or outlying area) as issued by the Department of Veterans Affairs and issued in M-1, Part I, Appendix B. These entries should remain as distributed and should not be edited or updated unless done via a software upgrade or under direction of VA Central Office.",
    "42": "#42 This file contains all the facility ward locations and their related data, i.e., Operating Beds, Bedsection, etc. The wards are created/edited using the WARD DEFINITION option of the ADT module.",
    "44": "#44 Contains locations found in the hospital (ie. Wards, Clinics)",
    "60": "#60 This is the file that holds the names and ordering, display of tests. APPLICATION GROUP(S): ORE, GMTS, PXRM",
    "63": "#63 Patient's laboratory data",
    "130": "#130 Each entry in the SURGERY file contains information regarding a surgery case made up of an operative procedure, or multiple operative procedures for a patient. The file includes the information necessary for creating the Nurses' Intraoperative Report, Operation Report, and Anesthesia Report",
    "200": "#200 This file contains data on employees, users, practitioners, etc. who were previously in Files 3,6,16 and others. DHCP packages must check with the KERNEL developers to see that a given number/namespace is clear for them to use. Field numbers 53-59.9 reserved for Pharm. Nodes and X-ref 'PS*'. Field numbers 70-79.9 reserved for Radiology Nodes and X-ref 'RA*'. Field numbers 720-725 reserved for DSSM Nodes and X-ref 'EC*' and 'AEC*'. Field numbers 740-749.9 reserved for QA Nodes and X-ref 'QA*'. Field numbers 654-654.9 reserved for Social work Node 654 and X-ref 'SW*'. Field numbers 500-500.9 reserved for mailman Node 500 and X-ref 'XM*' and 'AXM*'."
};

readXlsxFile("vista-dox3+228.9.xlsx", { sheet: "vista-dox", transformData(data)
    { data.shift(2); return data; }}).then((rows) => {
    // `rows` is an array of rows
    // each row being an array of cells.

    // var filenums = [ "4", "44", "42", "60", "63", "130", "5", "200", "2", "779.004" ];
    var filenums = [ "4", "200" ];

    // PASS 1: collect all POINTERS TO file# based on some start files
    //  and include those files in filenums
    rows.forEach(row => {
        var file = row[1];
        var filename = row[2];
        var field = row[3];
        var fieldname = row[4];
        var type = row[5];

        if (filenums.includes(file))
        {
            // ignore obsolete fields, starting with *
            if (type && !fieldname.startsWith("*")) {
                if (type.startsWith("POINTER TO ")) {
                    var targetid = type.substring(type.lastIndexOf('#') + 1, type.lastIndexOf(')'));
                    if (!filenums.includes(targetid)) {
                        filenums.push(targetid);
                    }
                }
                else if (type.startsWith("POINTER Multiple ")) {
                    var targetid = type.substring(type.lastIndexOf('#') + 1);
                    if (!filenums.includes(targetid)) {
                        filenums.push(targetid);
                    }
                }
                else if (type.startsWith("DATE Multiple ")) {
                    var targetid = type.substring(type.lastIndexOf('#') + 1);
                    if (!filenums.includes(targetid)) {
                        filenums.push(targetid);
                    }
                }
                else if (type.startsWith("Multiple ")) {
                    var targetid = type.substring(type.lastIndexOf('#') + 1);
                    if (!filenums.includes(targetid)) {
                        filenums.push(targetid);
                    }
                }
            }
        }
    });

    console.log(filenums);

    // PASS 2: now create the Logical Models
    rows.forEach(row => {
        var file = row[1];
        var filename = "" + row[2];
        var field = row[3];
        var fieldname = row[4];
        var type = row[5];
        var details = row[6];

        var _filename = filename.replace(/[^A-Za-z0-9\/\& ]/g,'');
        _filename = _filename.replace(/[ \/]/g,'_');

        if (filenums.includes(file))
        {
            var filesd = filesds[file];
            if (filesds[file] == undefined) {
                filesd = {
                    "resourceType": "StructureDefinition",
                    "id": `${file}`,
                    "url": `${BASE_URL_SD}${file}`,
                    "identifier": [ { 
                        "system": "http://va.gov/fhir/identifiers",
                        "value": file
                    } ],
                    "name": _filename,
                    "title": filename,
                    "status": "draft",
                    "date": "2023-01-16",
                    "description": filedesc[file] || `#${file}`,
                    "kind": "logical",
                    "abstract": false,
                    "type": BASE_URL_SD + _filename,
                    // "baseDefinition": BASE_URL_SD + "VistaFile",
                    "baseDefinition": "http://hl7.org/fhir/StructureDefinition/Resource",
                    "derivation": "specialization",
                    "differential": {
                        "element": [
                        ] }
                };
                filesds[file] = filesd;
                console.log(filename, file, filesd.description);
            }
    
            // ignore obsolete fields, starting with *
            if (type && !fieldname.startsWith("*")) {
                // get rid of illegal id chars
                var _fieldname = fieldname.replace(/[^A-Za-z0-9\/\& ]/g,'');
                _fieldname = _fieldname.trim().replace(/[ \/\&]/g,'_');

                // get DESCRIPTION for details
                var description = undefined;
                var card_min = 0;
                if (details) {
                    var desc_idx = details.indexOf("DESCRIPTION:");
                    if (desc_idx != -1) {
                        var _description = details.substring(desc_idx + 15).trim();
                        var desc_end_idx = _description.indexOf('\n');
                        if (desc_end_idx == -1) desc_end_idx = _description.length;
                        description = _description.substring(0, desc_end_idx).trim();
                    }
                    card_min = details.indexOf("*REQUIRED FIELD*")!=-1?1:0;
                }

                var element = {
                    "id": `${_filename}.${_fieldname}`.replace(/_/g,'-'),
                    "path": `${_filename}.${_fieldname}`,
                    "label": fieldname,
                    "short": field + (description?" " + description:""),
                    "definition": field + (description?" " + description:""),
                    "min": card_min,
                    "max": "1"
                };
                filesd.differential.element.push(element);

                if (type.startsWith("POINTER Multiple ")) {
                    var targetid = type.substring(type.lastIndexOf('#') + 1);
                    element.max = "*";
                    // convert targetid to name
                    element.type = [ {
                        "code": BASE_URL_SD + targetid
                    } ];
                }
                else if (type.startsWith("POINTER TO ")) {
                    var targetid = type.substring(type.lastIndexOf('#') + 1, type.lastIndexOf(')'));
                    //var targetfilename = type.substring(11, type.indexOf(" FILE")).replace(/ /g, '_');
                    element.type = [ {
                        "code": BASE_URL_SD + targetid
                    } ];
                }
                else if (type && type.startsWith("DATE Multiple ")) {
                    var targetid = type.substring(type.lastIndexOf('#') + 1);
                    element.max = "*";
                    element.type = [ {
                        "code": BASE_URL_SD + targetid
                    } ];
                }
                else if (type.startsWith("Multiple ")) {
                    var targetid = type.substring(type.lastIndexOf('#') + 1);
                    element.max = "*";
                    element.type = [ {
                        "code": BASE_URL_SD + targetid
                    } ];               
                }
                else {
                    element.type = [ {
                        "code": type.replace(/ /g,'_')
                    } ];
                }

                // create Valueset and binding if VistA type is SET
                if (type == "SET") {
                    var valueset = { 
                        "resourceType": "ValueSet",
                        "id": `${file}-${field}`,
                        "url": `${BASE_URL_VS}${file}-${field}`,
                        "identifier": [ { 
                            "system": "http://va.gov/fhir/vistaDefinedTerms",
                            "value": `${file}-${field}`
                        } ],
                        "name": `${_filename}_${_fieldname}`.replace(/-/g,'_'),
                        "title": `${filename}-${fieldname}`,
                        "status": "draft",
                        "experimental": false,
                        "description": `ValueSet for file ${filename} and field ${fieldname} (${file}-${field})`,
                        "compose": {
                            "include": [
                                {
                                    "system": `http://va.gov/fhir/vistaDefinedTerms/${file}-${field}`,
                                    "concept": [ ]
                                }
                            ]
                        }
                    };
                    var _values = details.matchAll(/('.+' FOR .+);\n/g);
                    for (_value of _values) {
                        var code = _value[0].match(/'([^']+)'/)[1];
                        var display = _value[0].match(/FOR (.+);/)[1];
                        valueset.compose.include[0].concept.push({
                            "code": code,
                            "display": display.trim()
                        });
                    };
                    valuesets.push(valueset);

                    // Next is workaround for QA error; but should show SET; so ignore
                    // element.type = [ { "code": "Coding" } ];
                    element.binding = {
                        "strength": "required",
                        "valueSet": valueset.url
                    };
                }                
            }
        }
    });

    Object.values(filesds).forEach(filesd => {
        var filename = "../input/resources/StructureDefinition-" + filesd.id + ".json";
        // console.log(filename);
        // console.log(JSON.stringify(filesd, null, 2));
        fs.writeFileSync(filename, JSON.stringify(filesd, null, 2))
    });

    valuesets.forEach(valueset => {
        var filename = "../input/resources/ValueSet-" + valueset.id + ".json";
        // console.log(filename);
        // console.log(JSON.stringify(valueset, null, 2));
        fs.writeFileSync(filename, JSON.stringify(valueset, null, 2))
    });
})