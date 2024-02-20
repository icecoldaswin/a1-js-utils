class TypingAnimator {
    constructor(properties) {
        this.props = properties;
        this.ongoing = 0;
        this.ongoingStringCharIdx = 0;

        this.TYPING_DELAY = this.props && this.props.typingDelay || 30; // 30 ms
        this.WAITING_DELAY = this.props && this.props.waitingDelay || 3000; // 3 s
    }

    animate(animationPlaceholderElement, loop) {
        if(this.props.punchLines === undefined || 
            this.props.punchLines === null || 
            this.props.punchLines.length === 0 || 
            animationPlaceholderElement === undefined) {
            return;
        }
        
        let delay = this.TYPING_DELAY;
        if(this.ongoingStringCharIdx === this.props.punchLines[this.ongoing].length) {
            if (this.ongoing === this.props.punchLines.length - 1) {
                if(loop === true) this.ongoing = 0 ;
                else return;
            } else {
                this.ongoing = this.ongoing + 1;
            } 
            this.ongoingStringCharIdx = 0;
            delay = this.WAITING_DELAY;
        } else {
            if(this.ongoingStringCharIdx==0) {
                animationPlaceholderElement.innerHTML = "";
            }
            animationPlaceholderElement.innerHTML = 
                animationPlaceholderElement.innerHTML + 
                    this.props.punchLines[this.ongoing].charAt(this.ongoingStringCharIdx);
            this.ongoingStringCharIdx++;
        }
        setTimeout(() => this.animate(animationPlaceholderElement, loop), delay);
    }
}