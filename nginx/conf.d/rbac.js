function authz(req, res) {
  var dn = req.variables.ssl_client_s_dn;
  if (dn == "-") {
    res.return(403);
    return;
  }

  req.error("Client certificate: " + dn);

  var match = RegExp('CN=([^,]+),?').exec(dn);
  if (match == null) {
    res.return(403);
    return;
  }

  var opa_data = {
    "input": {
      "user": match[1],
      "path": req.variables.request_uri,
      "method": req.variables.request_method
    }
  };

  var opts = {
    method: "POST",
    body: JSON.stringify(opa_data)
  };

  req.subrequest("/_opa", opts, function(opa) {
    req.error("OPA response: " + opa.body);

    var body = JSON.parse(opa.body);
    if (!body.result)  {
      res.return(403);
      return;
    }

    if (!body.result.allow) {
      res.return(403);
      return;
    }

    res.return(200);
  });
}
