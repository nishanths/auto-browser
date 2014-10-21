from twisted.web import server, resource
from twisted.internet import reactor, endpoints
import time
from PyMata.pymata import PyMata
import json
import sendgrid


BOARD_LED = 4

firmata = PyMata("/dev/tty.usbmodem1421")
sg = sendgrid.SendGridClient('nishanths','***********')

class Counter(resource.Resource):
    isLeaf = True
    numberRequests = 0
    num = 0
    awayCount = 0
    def __init__(self):
        time.sleep(1)
        firmata.set_pin_mode(BOARD_LED, firmata.OUTPUT, firmata.DIGITAL)
        firmata.sonar_config(13,12)
        print "Check"
    def render_GET(self, request):
        request.setHeader('Access-Control-Allow-Origin', '*')
        request.setHeader('Access-Control-Allow-Methods', 'GET')
        request.setHeader('Access-Control-Allow-Headers', 'x-prototype-version,x-requested-with')
        request.setHeader('Access-Control-Max-Age', 2520) # 42 hours
        self.numberRequests += 1
        resp = {}
        resp['success'] = True
        resp['request_number'] = self.numberRequests
        request.setHeader("content-type", "application/json")
        if request.postpath[0] == "brighten-lights":
            resp['action'] = 'ON'
            firmata.digital_write(BOARD_LED, 0)
            return json.dumps(resp)
        elif request.postpath[0] == "dim-lights":
            resp['action'] = 'OFF'  
            firmata.digital_write(BOARD_LED, 1)
            return json.dumps(resp)
        elif request.postpath[0] == "distance-sensors":
            resp['action'] = 'READ'
            resp['distance'] = firmata.get_sonar_data()[13]
            if (resp['distance'] > 100 or resp['distance'] == 0):
                self.awayCount += 1
            else:
                self.awayCount = 0
            if (self.awayCount >= 5):
                resp['away'] = True
                message = sendgrid.Mail(to='nishanths@utexas.edu', subject='You have been logged out of facebook', html='Body', text='Body', from_email='autobrowser@autobrowser.com')
                status, msg = sg.send(message)
            else:
                resp['away'] = False
            return json.dumps(resp)
        else:
            resp['action'] = 'NONE'
            resp['success'] = False

endpoints.serverFromString(reactor, "tcp:8080").listen(server.Site(Counter()))
reactor.run()
