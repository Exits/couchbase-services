
CREATE PRIMARY INDEX ON dp USING GSI;

https://blog.couchbase.com/use-aws-lambda-api-gateway-node-js-couchbase-nosql/

npm install -g serverless
serverless create --template aws-nodejs --path ./couchbase-services

# to set, or, to reset default aws credentials:

serverless config credentials --provider aws --key AKIAICVG5FNNSN34IVNQ --secret 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

docker pull amazonlinux:latest
# map a host dir to a container dir. pwd - current working path mapped to named container
docker run -v $(pwd):/gwiz-couchbase-service -it custom-amazon-linux

touch ~/.bash_profile
yum -y install gzip
yum -y install tar
chmod 777 /bin/tar
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
/bin/bash -c "source /root/.nvm/nvm.sh; nvm install 8.10.0"
/bin/bash -c "source /root/.nvm/nvm.sh; nvm use 8.10.0"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# compile from source
npm install "git+https://github.com/couchbase/couchnode.git#v2.6.2" --save


yum install -y git
yum -y groupinstall "Development Tools"


# 142.93.61.198
# demo 123456
# example


# find ../ -name '*libstdc*' -print
# find ../ -name '*GLIBCXX*' -print

command -v nvm # verify nvm
command -v npm # verify npm
command -v node # verify node
npm install couchbase joi uuid

# outside of docker command
npm install servless-offline --save-dev
