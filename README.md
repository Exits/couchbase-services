This project provides the functional JS supporting AWS Lambda functions accessible through an API Gateway. Persistence is pushed to a couchbase cluster.

# Updated instructions for this article: https://blog.couchbase.com/use-aws-lambda-api-gateway-node-js-couchbase-nosql/

# if not already installed, install serverless globally:
npm install -g serverless

# if the project hasn't already been created, run this:
serverless create --template aws-nodejs --path ./{your-projects-name-here}

# to set, or, to reset default aws credentials - replace the {text} with your aws credential key and secret
serverless config credentials --provider aws --key {aws-key-id} --secret {aws-secret}

# *** Install this from your machines project directory
# compile from source
npm install "git+https://github.com/couchbase/couchnode.git#v2.6.2" --save
docker build -t custom-amazon-linux . 	

# !!DON'T FORGET THE PERIOD!!!! -->"."<--
docker build -t custom-amazon-linux . 	

# docker images to list the docker images
docker images

# map a host dir to a container dir. pwd - "current working path" mapped to named container
docker run -v $(pwd):/gwiz-couchbase-service -it custom-amazon-linux

# the above will drop you into the root docker container directory
# you will be in the bash

#cd into the image working directory
cd gwiz-couchbase-service

# from with that directory, clean out any existing node_modules with this command:
rm -Rf node_modules

# install the stuff (it will use the package.json to install)
npm i 

