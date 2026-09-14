import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const result = await build({ entryPoints: ['src/productState.ts'], bundle: true, write: false, format: 'esm' });
const { getMerchInventory, getBuyerOrderState } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);

test('restocking a sold-out active listing makes it eligible for the merchandise feed', () => {
  const product = { product_type: 'clubmerch', status: 'active', availability: 'sold', stock_quantity: 0 };
  Object.assign(product, getMerchInventory('5'));
  assert.equal(product.stock_quantity, 5);
  assert.equal(product.status === 'active' && product.availability === 'available', true);
  Object.assign(product, getMerchInventory('0'));
  assert.equal(product.stock_quantity, 0);
  assert.equal(product.availability, 'sold');
});

test('restocking does not publish a listing hidden by an administrator', () => {
  const product = { status: 'hidden', availability: 'sold', stock_quantity: 0, ...getMerchInventory('3') };
  assert.equal(product.status, 'hidden');
});

test('invalid stock is rejected rather than rounded or silently reset to one', () => {
  for (const input of ['', ' ', '-1', '1.5', 'abc', 'Infinity']) {
    assert.throws(() => getMerchInventory(input), /whole number/);
  }
});

test('a pending secondhand request clears after rejection or cancellation without remounting', () => {
  let state = getBuyerOrderState('secondhand', [{ status: 'pending' }]);
  assert.equal(state.orderStatus, 'pending');
  for (const status of ['rejected', 'cancelled']) {
    state = getBuyerOrderState('secondhand', [{ status }]);
    assert.equal(state.orderStatus, null);
    assert.equal(state.hasCompletedPreviousOrder, false);
  }
  assert.equal(getBuyerOrderState('secondhand', []).orderStatus, null);
});

test('active requests and completed secondhand purchases stay blocked while completed merch allows repeat orders', () => {
  assert.equal(getBuyerOrderState('secondhand', [{ status: 'accepted' }]).orderStatus, 'accepted');
  assert.equal(getBuyerOrderState('secondhand', [{ status: 'completed' }]).orderStatus, 'completed');
  assert.deepEqual(getBuyerOrderState('clubmerch', [{ status: 'completed' }]), {
    orderStatus: null, hasCompletedPreviousOrder: true,
  });
  assert.deepEqual(getBuyerOrderState('clubmerch', [{ status: 'pending' }, { status: 'completed' }]), {
    orderStatus: 'pending', hasCompletedPreviousOrder: false,
  });
  assert.deepEqual(getBuyerOrderState('clubmerch', []), {
    orderStatus: null, hasCompletedPreviousOrder: false,
  });
});
