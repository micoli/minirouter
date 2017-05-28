#!/usr/bin/python
import sys
import time
import os
import argparse
from flask import Flask, request, render_template, jsonify
import json
from pprint import pprint
import pickle
pathname = os.path.dirname(sys.argv[0]) 
os.chdir(os.path.abspath(pathname))
'''
curl 'http://10.70.0.8/set'  -H 'Content-Type: application/x-www-form-urlencoded' -H 'Accept: application/json, text/plain, */*' --data 'server_ip=10.90.0.215&client_ip=10.90.16.235'
'''

route_by_client = {}
default_route = {'ip':'192.168.1.1','name':'default'}
routes = [default_route]

app = Flask(__name__)

@app.route('/',methods=['GET'])
def public_list():
    global routes,route_by_client
    return render_template('index.html',
                           servers = routes,
                           current_server = get_route_for_ip(request.remote_addr),
                           current_ip = request.remote_addr,
                           route_by_client = route_by_client,
                           current_server_name=get_current_server_name()
    )

@app.route('/get',methods=['GET'])
def public_get():
    global routes,route_by_client
    return jsonify({
                    'servers' : routes,
                    'current_server' : get_route_for_ip(request.remote_addr),
                    'current_ip' : request.remote_addr,
                    'route_by_client' : route_by_client,
                    'current_server_name' : get_current_server_name()
    }) 


@app.route('/set',methods=['POST'])
def public_save():
    global routes,route_by_client
    if(request.form.get('client_ip')!=None):
        print "change client:%s to server %s"%(request.form.get('client_ip'), request.form.get('server_ip'))
        route_by_client[request.form.get('client_ip')]=request.form.get('server_ip')
        with open(r"conf/route_by_client.pickle", "wb") as output_file:
            pickle.dump(route_by_client, output_file)
    return jsonify({'success':True})

def get_route_for_ip(client_ip_address):
    global route_by_client,default_dns_server
    if(client_ip_address in route_by_client):
        return route_by_client[client_ip_address]
    else:
        return default_route['ip']

def get_current_server_name():
    global routes
    for server in routes:
        if server['ip'] == get_route_for_ip(request.remote_addr):
            return server['name']
    return routes[0]['name']

def display(msg):
    msg=msg.strip()
    if msg.startswith("[-]"):
        print "\033[31m[-]\033[0m"+msg[3:]
    elif msg.startswith("[+]"):
        print "\033[32m[+]\033[0m"+msg[3:]
    elif msg.startswith("[i]"):
        print "\033[1;30m[i]\033[0m"+msg[3:]
    else:
        print msg

if __name__=='__main__':
    parser = argparse.ArgumentParser(prog='procks', description="Transparent SOCKS5/SOCKS4/HTTP_CONNECT Proxy")
    args=parser.parse_args()

    try:
        with open(r"conf/route_by_client.pickle", "rb") as input_file:
            route_by_client = pickle.load(input_file)
    except:
        route_by_client={}
    try:
        with open('conf/routes.txt') as data_file:
            routes = json.load(data_file)
            default_route = routes[0]
    except:
        routes=[]
    
    pprint(routes)
    
    bind_address="0.0.0.0"
    display("[+]  listening: %s:%s, default route: %s"%(bind_address,83,default_route))

    try:
        app.run(debug=False,port=83,host='0.0.0.0')
        while 1:
            time.sleep(1)
            sys.stderr.flush()
            sys.stdout.flush()

    except KeyboardInterrupt:
        pass
