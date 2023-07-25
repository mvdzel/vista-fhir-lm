The idea of this project is to generate a FHIR Logical Model from the VistA files and sub-files dictionaries.
Then we can use the FHIR Mapping Language to create mappings from VistA data to FHIR Profiles.

Experimental output is here https://vdzel.home.xs4all.nl/vista-fhir-lm

# FHIR IG stuff

The script generates a lot of artifacts. To make the IG generation proces a bit faster we left out the generation of narratives, json, xml and ttl for now. We need at least the json for the FML to work. 

IG Builder Parameters: 
http://build.fhir.org/ig/FHIR/fhir-tools-ig/branches/master/CodeSystem-ig-parameters.html

# Docker to run convert script
```
> docker run --name=vista-fhir-lm -it -v "$(pwd)":/app node:lts-buster /bin/bash
@> cd /app/vista2lm
@> node vista2lm
```

# To build IG
```
(optional)> curl -L https://github.com/HL7/fhir-ig-publisher/releases/latest/download/publisher.jar -o publisher.jar
> java -jar publisher.jar -ig ig.ini -tx n/a
```
## Validate
```
> java -jar ../latest-ig-publisher/org.hl7.fhir.validator.jar -version 4.0.1 input/resources/StructureDefinition-HOSPITAL-LOCATION.json -ig input/resources
```