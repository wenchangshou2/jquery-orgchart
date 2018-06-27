/*
 * jquery-orgchart
 * git@github.com:wenchangshou2/jquery-orgchart.git
 *
 * Copyright (c) 2018 wcs
 * Licensed under the MIT license.
 */
(function ($) {

  var funcFactory = {
    dom: buildNode,
    json: jsonBuildNode
  };

  function baseAssignValue(object, key, value) {
    if (key === '__proto__') {
      Object.defineProperty(object, key, {
        'configurable': true,
        'enumerable': true,
        'value': value,
        'writable': true
      });
    } else {
      object[key] = value;
    }
  }

  function groupBy(collection, iteratee) {
    return _.reduce(collection, function (result, value, key) {
      key = iteratee(value);
      if (hasOwnProperty.call(result, key)) {
        result[key].push(value);
      } else {
        baseAssignValue(result, key, [value]);
      }
      return result;
    }, {});
  }

  var smartArrayToTree = function (array, options) {
    options = Object.assign({
      id: 'id',
      pid: 'pid',
      children: 'children',
      firstPid: null
    }, options);
    var groupArray = groupBy(array, function (n) {
      console.log('n', n);
      return n[options.pid];
    });
    console.log('array', groupArray);
    var firstArray = groupArray[options.firstPid];
    transform(firstArray);

    function transform(startList) {
      if (startList) {
        for (var i = 0; i < startList.length; i++) {
          // groupArray[startList[i][options.id]] && (startList[i][options.children] = groupArray[startList[i][options.id]]);
          if (groupArray[startList[i][options.id]]) {
            startList[i][options.children] = groupArray[startList[i][options.id]];
          }
          transform(startList[i][options.children]);
        }
      }
    }
    return firstArray;
  };

  // Static method.
  $.fn.orgchart = function (options) {
    var opts = $.extend({}, $.fn.orgchart.defaults, options);
    var func = funcFactory[opts.renderType];
    if (opts.renderType === 'dom') {
      return this.each(function () {
      console.log('dom11111111');
        var $chartSource = $(this);
        var $this = $chartSource.clone();
        if (opts.levels > -1) {
          $this.find("ul").andSelf().filter(function () {
            return $chartSource.parsents("ul").length + 1 > opts.levelobjects;
          }).remove();
        }
        $this.data("chart-source", $chartSource);
        var $container = $("<div class='" + opts.chartClass + "'/>");
        if (opts.interactive) {
          $container.addClass("interactive");
        }
        var $root;
        if ($this.is("ul")) {
          $root = $this.find("li:first");
        } else if ($this.is("li")) {
          $root = $this;
        }
        if ($root) {
          func($root, $container, 0, 0, opts);
          $container.find("div.node a").click(function (evt) {
            evt.stopImmediatePropagation();
          });
          if (opts.replace) {
            opts.container.empty();
          }
          opts.container.append($container);
        }
      });
    } else if (opts.renderType === 'json') {
      return this.each(function () {
        var $container = $("<div class='" + opts.chartClass + "'/>");
        if (opts.interactive) {
          $container.addClass("interactive");
        }
        var $root;
        $root = opts.renderData.filter((item) => {
          return item.pid === null;
        });
        if ($root.length > 0) {
          opts.renderData = smartArrayToTree(opts.renderData);
          func(opts.renderData, $container, 0, 0, opts);
          $container.find("div.node a").click(function (evt) {
            evt.stopImmediatePropagation();
          });
          if (opts.replace) {
            opts.container.empty();
          }
          $(this).append($container);
        }
      });
    }
  };

  $.fn.orgchart.defaults = {
    container: $("body"),
    depth: -1,
    levels: -1,
    showLevels: -1,
    stack: false,
    chartClass: "orgChart",
    hoverClass: "hover",
    nodeText: function ($node) {
      return $node.clone().children("ul,li").remove().end().html();
    },
    isArray: function (arr) {
      return Array.isArray(arr);
    },
    interactive: false,
    fade: false,
    speed: "slow",
    nodeClicked: function ($node) {
      console.log($node);
    },
    copyClasses: true,
    copyData: true,
    copyStyles: true,
    copyTitle: true,
    replace: true,
    renderType: 'dom',
    renderData: [],
  };



  function jsonBuildNode($data, $appendTo, level, index, opts) {
    var $table = $("<table cellpadding='0' cellspacing='0' border='0'/>");
    var $tbody = $("<tbody/>");
    var $nodeRow = $("<tr/>").addClass("nodes");
    var $nodeCell = $("<td/>").addClass("node");
    $data = Array.isArray($data) ? $data[0] : $data;
    var $childNodes = $.extend(true, {}, $data.children);
    if ($data.children && $data.children.length > 0) {
      $nodeCell.attr("colspan", Object.keys($childNodes).length * 2);
    }
    var $adjunct = $data.adjunct;
    if ($adjunct) {
      var $adjunctDiv = $("<div>").addClass("adjunct node")
        .addClass("level" + level).addClass("node" + index)
        .addClass("level" + level + "-node" + index)
        .append($adjunct);
      $adjunctDiv.appendTo($nodeCell);
      var $linkDiv = $("<div>").addClass("adjunct-link");
      $linkDiv.appendTo($nodeCell);
    }
    var $heading = $("<h2>").html($data.text);
    var $nodeDiv = $("<div>").addClass("node")
      .addClass("level" + level)
      .addClass("node" + index)
      .addClass("level" + level + "-node" + index)
      .append($heading);

    $nodeCell.append($nodeDiv);
    $nodeRow.append($nodeCell);
    $tbody.append($nodeRow);
    if ($childNodes && Object.keys($childNodes).length > 0) {
      if (opts.depth === -1 || level + 1 < opts.depth) {
        var $downLineRow = $("<tr/>").addClass("lines");
        var $downLineCell = $("<td/>").attr("colspan", Object.keys($childNodes).length * 2);
        $downLineRow.append($downLineCell);
        var $downLineTable = $("<table cellpadding='0' cellspacing='0' border='0'>");
        $downLineTable.append("<tbody>");
        var $downLineLine = $("<tr/>").addClass("lines x");
        var $downLeft = $("<td>").addClass("line left");
        var $downRight = $("<td>").addClass("line right");
        $downLineLine.append($downLeft).append($downRight);
        $downLineTable.children("tbody").append($downLineLine);
        $downLineCell.append($downLineTable);
        $tbody.append($downLineRow);
        $nodeDiv.addClass("hashChildren");
        if (opts.showLevels === -1 || level < opts.showLevels - 1) {
          $nodeDiv.addClass("shownChildren");
        } else {
          $nodeDiv.addClass("hiddenChildren");
        }
        if (opts.interactive) {
          $nodeDiv.hover(function () {
            $(this).addClass(opts.hoverClass);
          }, function () {
            $(this).removeClass(opts.hoverClass);
          });
        }
        var $linesRow = $("<tr/>").addClass("lines v");
        var key;
        for (key in $childNodes) {
          var $left = $("<td/>").addClass("line left top");
          var $right = $("<td/>").addClass("line right top");
          $linesRow.append($left).append($right);

        }
        $linesRow.find("td:first").removeClass("top");
        $linesRow.find("td:last").removeClass("top");
        $tbody.append($linesRow);
        var $childNodesRow = $("<tr/>");
        console.log('childnodes', $childNodes, typeof $childNodes);
        for (key in $childNodes) {
          console.log('key', $childNodes[key]);
          var $td = $("<td/>");
          $td.attr("colspan", 2);
          jsonBuildNode($childNodes[key], $td, level + 1, index, opts);
          $childNodesRow.append($td);
        }
        $tbody.append($childNodesRow);
      } else if (opts.stack) {
        var $stackNodes = $childNodes.clone();
        var $list = $("<ul class='stack'>").append($stackNodes).addClass("level" + level).addClass("node" + index).addClass("level" + level + "-node" + index);
        var $stackContainer = $("<div class='stack-container'>").append($list);
        $nodeDiv.after($stackContainer);
      }
    }

    if (opts.showLevels > -1 && level >= opts.showLevels - 1) {
      $nodeRow.nextAll("tr").hide();
    }

    $table.append($tbody);
    $appendTo.append($table);
    // var $childNodes=$
  }

  function buildNode($node, $appendTo, level, index, opts) {
    var $table = $("<table cellpadding='0' cellspacing='0' border='0'/>");
    var $tbody = $("<tbody/>");
    var $nodeRow = $("<tr/>").addClass("nodes");
    var $nodeCell = $("<td/>").addClass("node").attr("colspan", 2);
    var $childNodes = $node.children("ul:first").children("li");
    if ($childNodes.length > 1) {
      $nodeCell.attr("colspan", $childNodes.length * 2);
    }
    var $adjunct = $node.children("adjunct").eq(0);
    if ($adjunct.length > 0) {
      var $adjunctDiv = $("<div>").addClass("adjunct node")
        .addClass("level" + level).addClass("node" + index)
        .addClass("level" + level + "-node" + index)
        .append(opts.nodeText($adjunct));
      $adjunctDiv.appendTo($nodeCell);
      var $linkDiv = $("<div>").addClass("adjunct-link");
      $linkDiv.appendTo($nodeCell);
      $adjunct.remove();
    }

    var $heading = $("<h2>").html(opts.nodeText($node));
    var $nodeDiv = $("<div>").addClass("node")
      .addClass("level" + level)
      .addClass("node" + index)
      .addClass("level" + level + "-node" + index)
      .append($heading);
    //从源列表 chart结点复制class
    if (opts.copyClasses) {
      $nodeDiv.addClass($node.attr("class"));
    }
    //将数据从源列表复制到图表节点
    if (opts.copyData) {
      console.log('data', $node.data());
      $nodeDiv.data($node.data());
    }

    //将样式从源列表复制到图表节点
    if (opts.copyStyles) {
      $nodeDiv.attr("style", $node.attr("style"));
    }
    //将标题从源列表复制到图表结点
    if (opts.copyTitle) {
      console.log('title', $node.attr('title'));
      $nodeDiv.attr("title", $node.attr("title"));
    }
    $nodeDiv.data("orgchart-level", level).data("orgchart-node", $node);
    $nodeCell.append($nodeDiv);
    $nodeRow.append($nodeCell);
    $tbody.append($nodeRow);
    $nodeDiv.click(function () {
      var $this = $(this);
      opts.nodeClicked($this.data("orgchart-node"), $this);
      if (opts.interactive) {
        var $row = $this.closest("tr");
        if ($row.next("tr").is(":visible")) {
          if (opts.fade) {
            $row.nextAll("tr").fadeOut(opts.speed);
          } else {
            $row.nextAll("tr").hide();
          }
          $this.removeClass("shownChildren").addClass("hiddenChildren");
        } else {
          $this.removeClass("hiddenChildren").addClass("shownChildren");
          if (opts.fade) {
            $row.nextAll("tr").fadeIn(opts.speed);
          } else {
            $row.nextAll("tr").show();
          }
        }
      }
    });
    if ($childNodes.length > 0) {
      if (opts.depth === -1 || level + 1 < opts.depth) {
        var $downLineRow = $("<tr/>").addClass("lines");
        var $downLineCell = $("<td/>").attr("colspan", $childNodes.length * 2);
        $downLineRow.append($downLineCell);

        var $downLineTable = $("<table cellpadding='0' cellspacing='0' border='0'>");
        $downLineTable.append("<tbody>");
        var $downLineLine = $("<tr/>").addClass("lines x");
        var $downLeft = $("<td>").addClass("line left");
        var $downRight = $("<td>").addClass("line right");
        $downLineLine.append($downLeft).append($downRight);
        $downLineTable.children("tbody").append($downLineLine);
        $downLineCell.append($downLineTable);

        $tbody.append($downLineRow);

        if ($childNodes.length > 0) {
          $nodeDiv.addClass("hasChildren");
          if (opts.showLevels === -1 || level < opts.showLevels - 1) {
            $nodeDiv.addClass("shownChildren");
          } else {
            $nodeDiv.addClass("hiddenChildren");
          }
          if (opts.interactive) {
            $nodeDiv.hover(function () {
              $(this).addClass(opts.hoverClass);
            }, function () {
              $(this).removeClass(opts.hoverClass);
            });
          }
        }

        // Recursively make child nodes...
        var $linesRow = $("<tr/>").addClass("lines v");
        $childNodes.each(function () {
          var $left = $("<td/>").addClass("line left top");
          var $right = $("<td/>").addClass("line right top");
          $linesRow.append($left).append($right);
        });
        $linesRow.find("td:first").removeClass("top");
        $linesRow.find("td:last").removeClass("top");
        $tbody.append($linesRow);
        var $childNodesRow = $("<tr/>");
        $childNodes.each(function (index) {
          var $td = $("<td/>");
          $td.attr("colspan", 2);
          buildNode($(this), $td, level + 1, index, opts);
          $childNodesRow.append($td);
        });
        $tbody.append($childNodesRow);
      } else if (opts.stack) {
        var $stackNodes = $childNodes.clone();
        var $list = $("<ul class='stack'>").append($stackNodes).addClass("level" + level).addClass("node" + index).addClass("level" + level + "-node" + index);
        var $stackContainer = $("<div class='stack-container'>").append($list);
        $nodeDiv.after($stackContainer);
      }
    }

    if (opts.showLevels > -1 && level >= opts.showLevels - 1) {
      $nodeRow.nextAll("tr").hide();
    }
    $table.append($tbody);
    $appendTo.append($table);
  }

}(jQuery));