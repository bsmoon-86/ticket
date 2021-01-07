      jQuery(document).ready(function(){
        $(document).mousemove(function(e){      //마우스 이동시 move에 좌표 입력
        });
        $(document).mousedown(function(e){      //마우스 클릭시 click에 좌표 입력
            $.post("click", {x: e.pageX, y: e.pageY});
        });
      })