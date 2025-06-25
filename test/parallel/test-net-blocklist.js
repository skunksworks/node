'use strict';

const common = require('../common');
const net = require('net');
const assert = require('assert');
const { BlockList } = net;
const blockList = new net.BlockList();
blockList.addAddress('127.0.0.1');
blockList.addAddress('127.0.0.2');

function check(err) {
  assert.ok(err.code === 'ERR_IP_BLOCKED', err);
}

// Connect without calling dns.lookup
{
  const socket = net.connect({
    port: 9999,
    host: '127.0.0.1',
    blockList,
  });
  socket.on('error', common.mustCall(check));
}

// Connect with single IP returned by dns.lookup
{
  const socket = net.connect({
    port: 9999,
    host: 'localhost',
    blockList,
    lookup: function(_, __, cb) {
      cb(null, '127.0.0.1', 4);
    },
    autoSelectFamily: false,
  });

  socket.on('error', common.mustCall(check));
}

// Connect with autoSelectFamily and single IP
{
  const socket = net.connect({
    port: 9999,
    host: 'localhost',
    blockList,
    lookup: function(_, __, cb) {
      cb(null, [{ address: '127.0.0.1', family: 4 }]);
    },
    autoSelectFamily: true,
  });

  socket.on('error', common.mustCall(check));
}

// Connect with autoSelectFamily and multiple IPs
{
  const socket = net.connect({
    port: 9999,
    host: 'localhost',
    blockList,
    lookup: function(_, __, cb) {
      cb(null, [{ address: '127.0.0.1', family: 4 }, { address: '127.0.0.2', family: 4 }]);
    },
    autoSelectFamily: true,
  });

  socket.on('error', common.mustCall(check));
}

const data = [
  'Subnet: IPv4 192.168.1.0/24',
  'Address: IPv4 10.0.0.5',
  'Range: IPv4 192.168.2.1-192.168.2.10',
  'Range: IPv4 10.0.0.1-10.0.0.10',
  'Subnet: IPv6 2001:0db8:85a3:0000:0000:8a2e:0370:7334/64',
  'Address: IPv6 2001:0db8:85a3:0000:0000:8a2e:0370:7334',
  'Range: IPv6 2001:0db8:85a3:0000:0000:8a2e:0370:7334-2001:0db8:85a3:0000:0000:8a2e:0370:7335',
  'Subnet: IPv6 2001:db8:1234::/48',
  'Address: IPv6 2001:db8:1234::1',
  'Range: IPv6 2001:db8:1234::1-2001:db8:1234::10',
];
const test = new BlockList();
const test2 = new BlockList();
const test3 = new BlockList();
const test4 = new BlockList();
test.addAddress('127.0.0.1');
test.addAddress('192.168.0.1');
test2.fromJSON(test.toJSON());
test2.fromJSON(JSON.stringify(test.toJSON()));
test3.fromJSON(data);
data.forEach((item) => {
  test4.fromJSON([item]);
});
assert.deepStrictEqual(test2.rules, test.rules);
assert.deepStrictEqual(test3.rules, data);
data.map((t) => {
  return assert.strictEqual(test3.check(t), true);
});