
Output is here https://vdzel.home.xs4all.nl/vista-fhir-lm

IG Builder Parameters: 
http://build.fhir.org/ig/FHIR/fhir-tools-ig/branches/master/CodeSystem-ig-parameters.html

# To build IG
(optional)> curl -L https://github.com/HL7/fhir-ig-publisher/releases/latest/download/publisher.jar -o publisher.jar
> java -jar publisher.jar -ig ig.ini -tx n/a

# Validate
> java -jar ../latest-ig-publisher/org.hl7.fhir.validator.jar -version 4.0.1 input/resources/StructureDefinition-HOSPITAL-LOCATION.json -ig input/resources

# Docker to run convert script
> docker run --name=vista-fhir-lm -it -v "$(pwd)":/app node:lts-buster /bin/bash
@> cd /app/vista2lm
@> node vista2lm