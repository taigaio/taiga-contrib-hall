// Generated by CoffeeScript 1.9.3
(function() {
  var HallAdmin, HallWebhooksDirective, debounce, hallInfo, initHallPlugin, module;

  this.taigaContribPlugins = this.taigaContribPlugins || [];

  hallInfo = {
    slug: "hall",
    name: "Hall",
    type: "admin",
    module: 'taigaContrib.hall'
  };

  this.taigaContribPlugins.push(hallInfo);

  module = angular.module('taigaContrib.hall', []);

  debounce = function(wait, func) {
    return _.debounce(func, wait, {
      leading: true,
      trailing: false
    });
  };

  initHallPlugin = function($tgUrls) {
    return $tgUrls.update({
      "hall": "/hall"
    });
  };

  HallAdmin = (function() {
    HallAdmin.$inject = ["$rootScope", "$scope", "$tgRepo", "tgAppMetaService", "$tgConfirm", "$tgHttp"];

    function HallAdmin(rootScope, scope, repo, appMetaService, confirm, http) {
      this.rootScope = rootScope;
      this.scope = scope;
      this.repo = repo;
      this.appMetaService = appMetaService;
      this.confirm = confirm;
      this.http = http;
      this.scope.sectionName = "Hall";
      this.scope.sectionSlug = "hall";
      this.scope.$on("project:loaded", (function(_this) {
        return function() {
          var promise;
          promise = _this.repo.queryMany("hall", {
            project: _this.scope.projectId
          });
          promise.then(function(hallhooks) {
            var description, title;
            _this.scope.hallhook = {
              project: _this.scope.projectId
            };
            if (hallhooks.length > 0) {
              _this.scope.hallhook = hallhooks[0];
            }
            title = _this.scope.sectionName + " - Plugins - " + _this.scope.project.name;
            description = _this.scope.project.description;
            return _this.appMetaService.setAll(title, description);
          });
          return promise.then(null, function() {
            return _this.confirm.notify("error");
          });
        };
      })(this));
    }

    HallAdmin.prototype.testHook = function() {
      var promise;
      promise = this.http.post(this.repo.resolveUrlForModel(this.scope.hallhook) + '/test');
      promise.success((function(_this) {
        return function(_data, _status) {
          return _this.confirm.notify("success");
        };
      })(this));
      return promise.error((function(_this) {
        return function(data, status) {
          return _this.confirm.notify("error");
        };
      })(this));
    };

    return HallAdmin;

  })();

  module.controller("ContribHallAdminController", HallAdmin);

  HallWebhooksDirective = function($repo, $confirm, $loading) {
    var link;
    link = function($scope, $el, $attrs) {
      var form, submit, submitButton;
      form = $el.find("form").checksley({
        "onlyOneErrorElement": true
      });
      submit = debounce(2000, (function(_this) {
        return function(event) {
          var currentLoading, promise;
          event.preventDefault();
          if (!form.validate()) {
            return;
          }
          currentLoading = $loading().target(submitButton).start();
          if (!$scope.hallhook.id) {
            promise = $repo.create("hall", $scope.hallhook);
            promise.then(function(data) {
              return $scope.hallhook = data;
            });
          } else if ($scope.hallhook.url) {
            promise = $repo.save($scope.hallhook);
            promise.then(function(data) {
              return $scope.hallhook = data;
            });
          } else {
            promise = $repo.remove($scope.hallhook);
            promise.then(function(data) {
              return $scope.hallhook = {
                project: $scope.projectId
              };
            });
          }
          promise.then(function() {
            currentLoading.finish();
            return $confirm.notify("success");
          });
          return promise.then(null, function(data) {
            currentLoading.finish();
            form.setErrors(data);
            if (data._error_message) {
              return $confirm.notify("error", data._error_message);
            }
          });
        };
      })(this));
      submitButton = $el.find(".submit-button");
      $el.on("submit", "form", submit);
      return $el.on("click", ".submit-button", submit);
    };
    return {
      link: link
    };
  };

  module.directive("contribHallWebhooks", ["$tgRepo", "$tgConfirm", "$tgLoading", HallWebhooksDirective]);

  module.run(["$tgUrls", initHallPlugin]);

  module.run([
    '$templateCache', function($templateCache) {
      return $templateCache.put('contrib/hall', '<div contrib-hall-webhooks="contrib-hall-webhooks" ng-controller="ContribHallAdminController as ctrl"><header><h1><span class="project-name">{{::project.name}}</span><span class="green">{{::sectionName}}</span></h1></header><form><label for="url">Hall webhook url</label><div class="contrib-form-wrapper"><fieldset><input type="text" name="url" ng-model="hallhook.url" placeholder="Hall webhook url" id="url" data-type="url"/></fieldset><fieldset ng-show="hallhook.id" class="contrib-test"><a href="" title="Test" ng-click="ctrl.testHook()" class="button-gray"><span>Test</span></a></fieldset></div><button type="submit" class="hidden"></button><a href="" title="Save" ng-click="ctrl.updateOrCreateHook(hallhook)" class="button-green submit-button"><span>Save</span></a></form><a href="https://taiga.io/support/hall-integration/" target="_blank" class="help-button"><span class="icon icon-help"></span><span>Do you need help? Check out our support page!</span></a></div>');
    }
  ]);

}).call(this);
