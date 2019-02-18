FROM amazonlinux:1

RUN yum install -y git
RUN yum -y groupinstall "Development Tools"
RUN yum -y install gzip
RUN yum -y install tar
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
RUN /bin/bash -c "source /root/.nvm/nvm.sh; nvm install 8.10.0"
CMD /bin/bash -c "source /root/.nvm/nvm.sh; nvm use 8.10.0; bash"
