# this vagrant-file needs the following plugins:
# * vagrant-dns
# * vagrant-fabric

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"
Vagrant.require_version ">= 1.6"
require 'yaml'

path = "#{File.dirname(__FILE__)}"
ip_address = "33.33.33.33"
local_http_port = 8080
sitename = "multibasebox.dev"



# Check hostmanager required plugin
REQUIRED_PLUGINS = %w(vagrant-dns vagrant-fabric)
exit unless REQUIRED_PLUGINS.all? do |plugin|
  Vagrant.has_plugin?(plugin) || (
    puts "The #{plugin} plugin is required. Please install it with:"
    puts "$ vagrant plugin install #{plugin}"
    false
  )
end

# provisioning script
$script = <<SCRIPT
echo "Install packages..."
apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
rm -f /etc/apt/sources.list.d/docker.list
echo deb https://apt.dockerproject.org/repo ubuntu-trusty main > /etc/apt/sources.list.d/docker.list
apt-get purge -y lxc-docker*
apt-get update -qq 
apt-get install -q -y --force-yes linux-image-extra-$(uname -r)
apt-get install -q -y --force-yes docker-engine python-setuptools software-properties-common python-software-properties cachefilesd
echo "RUN=yes" > /etc/default/cachefilesd
usermod -a -G docker vagrant

echo "Installing haproxy 1.5"
apt-add-repository  ppa:vbernat/haproxy-1.5
apt-get update -qq; apt-get install -q -y --force-yes haproxy

echo "Installing python and pip..."
easy_install pip
pip install --upgrade pip virtualenv virtualenvwrapper

echo "Copying haproxy_config..."
pip install virtualenv
mkdir -p /home/vagrant/bin
cp -R /tmp/provisioning/haproxy_config /home/vagrant/bin/
cp /tmp/provisioning/haproxy_config.conf /etc/init/

echo "Provisioning haproxy_config..."
cd /home/vagrant/bin/haproxy_config
virtualenv env
env/bin/pip install -r requirements.txt

SCRIPT

# get hosts
hosts = {}
config_files = Dir.glob(path + '/projects/*/fabfile.yaml') + Dir.glob(path + '/projects/*/fabfile.yaml.inc')
config_files.each do |path|
  key = File.dirname(path)
  yamlConfig = YAML.load_file(path)
  if yamlConfig['hosts']
    host = false
    if yamlConfig['hosts']['mbb'] && yamlConfig['hosts']['mbb']['host']
      host = yamlConfig['hosts']['mbb']['host']
    elsif yamlConfig['hosts']['local'] && yamlConfig['hosts']['local']['host']
      host = yamlConfig['hosts']['local']['host']
    end
    if host
      hosts[key] = host
      hosts["www" + key] = "www." + host
    end
  end
end

# new fabalicious folder-structure
config_files = Dir.glob('projects/*/fabalicious/hosts/local.yaml') + Dir.glob('projects/*/fabalicious/hosts/mbb.yaml')
config_files.each do |path|
  key = File.dirname(path)
  yamlConfig = YAML.load_file(path)
  if yamlConfig['host']
    hosts[key] = yamlConfig['host']
    hosts["www" + key] = "www." + yamlConfig['host']
  end
end

system('./vagrant dns --start')

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "phusion-open-ubuntu-14.04-amd64"
  config.vm.box_url = "https://oss-binaries.phusionpassenger.com/vagrant/boxes/latest/ubuntu-14.04-amd64-vbox.box"
  # Or, for Ubuntu 12.04:
  #config.vm.box = "phusion-open-ubuntu-12.04-amd64"
  #config.vm.box_url = "https://oss-binaries.phusionpassenger.com/vagrant/boxes/latest/ubuntu-12.04-amd64-vbox.box"

  config.vm.provider :vmware_fusion do |f, override|
    override.vm.box_url = "https://oss-binaries.phusionpassenger.com/vagrant/boxes/latest/ubuntu-14.04-amd64-vmwarefusion.box"
    #override.vm.box_url = "https://oss-binaries.phusionpassenger.com/vagrant/boxes/latest/ubuntu-12.04-amd64-vmwarefusion.box"
  end

  config.vm.network :private_network, ip: ip_address

  if local_http_port
    config.vm.network "forwarded_port", guest: 80, host: local_http_port
  end

  config.dns.tld = "dev"
  config.vm.hostname = "multibasebox"
  config.dns.patterns = [/^.*.dev$/]

  config.vm.hostname = sitename

  config.ssh.forward_agent = true

  config.vm.synced_folder "./projects", "/vagrant", nfs: true, mount_options: ["nolock", "vers=3", "tcp", "fsc"]
  config.vm.synced_folder "./bin", "/tmp/provisioning", nfs: true

  #increase memory
  config.vm.provider "virtualbox" do |v|
    v.customize ["modifyvm", :id, "--cpuexecutioncap", "80"]
    v.customize ["modifyvm", :id, "--memory", 4536]
    v.cpus = 2
  end

  config.vm.provider "vmware_fusion" do |v|
    v.vmx["memsize"] = "1536"
    v.vmx["numvcpus"] = "2"
  end

  # shell provisioner
  config.vm.provision "shell", inline: $script
end

if File.file?('vagrant.local')
  load "./vagrant.local"
end
