"use strict";
var mocha  = require('mocha');
var expect = require('chai').expect;

var ViewUtil = require('../../../dist/nano-records/util/view').ViewUtil;

describe('util view', () => {
  
  it('generateName', () => {
    expect(ViewUtil.generateName("key1")).to.equal("key1");
    expect(ViewUtil.generateName(["key1"])).to.equal("key1_A_");
    expect(ViewUtil.generateName(["key1", "key2", "key3"])).to.equal("key1_K_key2_K_key3_A_");
    expect(ViewUtil.generateName("key1", "value1")).to.equal("key1_S_value1");
    expect(ViewUtil.generateName(["key1"], ["value1"])).to.equal("key1_A__S_value1_A_");
    expect(ViewUtil.generateName(["key1", "key2", "key3"], ["value1", "value2", "value3"])).to.equal("key1_K_key2_K_key3_A__S_value1_V_value2_V_value3_A_");
    expect(ViewUtil.generateName("key1", ["value1", "value2", "value3"])).to.equal("key1_S_value1_V_value2_V_value3_A_");
    expect(ViewUtil.generateName("key1.deep1", "value1.deep2")).to.equal("key1_D_deep1_S_value1_D_deep2");
    expect(ViewUtil.generateName(["key1.deep1", "key2.deep2", "key3.deep3"], ["value1.deep4", "value2.deep5", "value3.deep6"])).to.equal("key1_D_deep1_K_key2_D_deep2_K_key3_D_deep3_A__S_value1_D_deep4_V_value2_D_deep5_V_value3_D_deep6_A_");
    expect(ViewUtil.generateName("key1.deep1.deep2", "value1")).to.equal("key1_D_deep1_D_deep2_S_value1");
  });
  
  it('emitKey', () => {
    expect(ViewUtil.emitKey("key1")).to.equal("doc.key1");
    expect(ViewUtil.emitKey(["key1", "key2", "key3"])).to.equal("[doc.key1,doc.key2,doc.key3]");
    expect(ViewUtil.emitKey("key1.deep1")).to.equal("doc.key1.deep1");
    expect(ViewUtil.emitKey(["key1.deep1", "key2.deep2", "key3.deep3"])).to.equal("[doc.key1.deep1,doc.key2.deep2,doc.key3.deep3]");
    expect(ViewUtil.emitKey("key1.deep1.deep2")).to.equal("doc.key1.deep1.deep2");
  });
  
  it('emitValue', () => {
    expect(ViewUtil.emitValue("key1")).to.equal("{key1:doc.key1}");
    expect(ViewUtil.emitValue(["key1", "key2", "key3"])).to.equal("{key1:doc.key1,key2:doc.key2,key3:doc.key3}");
    expect(ViewUtil.emitValue("key1.deep1")).to.equal("{key1:{deep1:doc.key1.deep1}}");
    expect(ViewUtil.emitValue(["key1.deep1", "key2.deep2", "key3.deep3"])).to.equal("{key1:{deep1:doc.key1.deep1},key2:{deep2:doc.key2.deep2},key3:{deep3:doc.key3.deep3}}");
    expect(ViewUtil.emitValue(["key1.deep1", "key1.deep2", "key2.deep3"])).to.equal("{key1:{deep1:doc.key1.deep1,deep2:doc.key1.deep2},key2:{deep3:doc.key2.deep3}}");
    expect(ViewUtil.emitValue("key1.deep1.deep2")).to.equal("{key1:{deep1:{deep2:doc.key1.deep1.deep2}}}");
  });
  
  it('mapFunction', () => {
    expect(ViewUtil.mapFunction("key1")).to.equal("function (doc) { emit(doc.key1,null); }");
    expect(ViewUtil.mapFunction("key1", "value1")).to.equal("function (doc) { emit(doc.key1,{value1:doc.value1}); }");
    expect(ViewUtil.mapFunction(["key1", "key2", "key3"])).to.equal("function (doc) { emit([doc.key1,doc.key2,doc.key3],null); }");
    expect(ViewUtil.mapFunction(["key1", "key2", "key3"], ["value1", "value2", "value3"])).to.equal("function (doc) { emit([doc.key1,doc.key2,doc.key3],{value1:doc.value1,value2:doc.value2,value3:doc.value3}); }");
    expect(ViewUtil.mapFunction("key1", ["value1", "value2", "value3"])).to.equal("function (doc) { emit(doc.key1,{value1:doc.value1,value2:doc.value2,value3:doc.value3}); }");
    expect(ViewUtil.mapFunction("key1.deep1")).to.equal("function (doc) { if (doc.key1) { emit(doc.key1.deep1,null); } }");
    expect(ViewUtil.mapFunction("key1.deep1", "value1.deep2")).to.equal("function (doc) { if (doc.key1&&doc.value1) { emit(doc.key1.deep1,{value1:{deep2:doc.value1.deep2}}); } }");
    let result1 = "function (doc) { if (doc.key1&&doc.key1.deep1&&doc.key2&&doc.key2.deep3&&doc.key3&&doc.key3.deep5) { emit([doc.key1.deep1.deep2,doc.key2.deep3.deep4,doc.key3.deep5.deep6],null); } }";
    expect(ViewUtil.mapFunction(["key1.deep1.deep2", "key2.deep3.deep4", "key3.deep5.deep6"])).to.equal(result1);
    let result2 = "function (doc) { if (doc.value1&&doc.value1.deep1&&doc.value2&&doc.value2.deep3&&doc.value3&&doc.value3.deep5) { emit(doc.key1,{value1:{deep1:{deep2:doc.value1.deep1.deep2}},value2:{deep3:{deep4:doc.value2.deep3.deep4}},value3:{deep5:{deep6:doc.value3.deep5.deep6}}}); } }";
    expect(ViewUtil.mapFunction("key1", ["value1.deep1.deep2", "value2.deep3.deep4", "value3.deep5.deep6"])).to.equal(result2);
  });
  
});
