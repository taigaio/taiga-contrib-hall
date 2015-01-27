// Generated by CoffeeScript 1.8.0
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
    HallAdmin.$inject = ["$rootScope", "$scope", "$tgRepo", "$appTitle", "$tgConfirm"];

    function HallAdmin(rootScope, scope, repo, appTitle, confirm) {
      this.rootScope = rootScope;
      this.scope = scope;
      this.repo = repo;
      this.appTitle = appTitle;
      this.confirm = confirm;
      this.scope.sectionName = "Hall";
      this.scope.sectionSlug = "hall";
      this.scope.$on("project:loaded", (function(_this) {
        return function() {
          var promise;
          promise = _this.repo.queryMany("hall", {
            project: _this.scope.projectId
          });
          promise.then(function(hallhooks) {
            _this.scope.hallhook = {
              project: _this.scope.projectId
            };
            if (hallhooks.length > 0) {
              _this.scope.hallhook = hallhooks[0];
            }
            return _this.appTitle.set("Hall - " + _this.scope.project.name);
          });
          return promise.then(null, function() {
            return _this.confirm.notify("error");
          });
        };
      })(this));
    }

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
          var promise;
          event.preventDefault();
          if (!form.validate()) {
            return;
          }
          $loading.start(submitButton);
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
            $loading.finish(submitButton);
            return $confirm.notify("success");
          });
          return promise.then(null, function(data) {
            $loading.finish(submitButton);
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
      return $templateCache.put('contrib/hall', '<div contrib-hall-webhooks="contrib-hall-webhooks" ng-controller="ContribHallAdminController as ctrl"><header><h1 tg-main-title="tg-main-title"></h1></header><form><fieldset><label for="url">Hall webhook url</label><input type="text" name="url" ng-model="hallhook.url" placeholder="Hall webhook url" id="url"/></fieldset><button type="submit" class="hidden"></button><a href="" title="Save" ng-click="ctrl.updateOrCreateHook(hallhook)" class="button button-green submit-button">Save</a></form><a href="https://taiga.io/support/hall-integration/" target="_blank" class="help-button"><span class="icon icon-help"></span><span>Do you need help? Check out our support page!</span></a></div>');
    }
  ]);

}).call(this);
