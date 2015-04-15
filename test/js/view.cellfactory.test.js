describe('view.cellfactory', function() {
    var cellFactory,
        $empty;
    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/';
        loadFixtures('test/fixtures/empty.html');
        $empty = $('#empty');

        cellFactory = new View.CellFactory({
            grid: {}
        });
    });
    describe('initialize', function() {
        it('instance 를 잘 생성하는지 확인한다.', function() {
            expect(cellFactory.instances).toBeDefined();
        });
    });
    describe('getInstance', function() {
        it('editType 에 따라 적절한 instance 를 반환하는지 확인한다.', function() {
            expect(cellFactory.getInstance('normal')).toEqual(cellFactory.instances['normal']);
            expect(cellFactory.getInstance('text')).toEqual(cellFactory.instances['text']);
            expect(cellFactory.getInstance('text-convertible')).toEqual(cellFactory.instances['text-convertible']);
            expect(cellFactory.getInstance('radio')).toEqual(cellFactory.instances['button']);
            expect(cellFactory.getInstance('checkbox')).toEqual(cellFactory.instances['button']);
            expect(cellFactory.getInstance('select')).toEqual(cellFactory.instances['select']);
            expect(cellFactory.getInstance('undefined')).toEqual(cellFactory.instances['normal']);
        });
    });
    describe('각 td 에 적절한 instance 의 attachHandler 를 수행하는지 확인한다.', function() {
        beforeEach(function() {
            _.each(cellFactory.instances, function(instance, editType) {
                cellFactory.instances[editType].attachHandler = jasmine.createSpy(editType);
            }, this);
        });
        it('normal', function() {
            $empty.html('<td edit-type="normal">');
            cellFactory.attachHandler($empty);
            expect(cellFactory.instances['normal'].attachHandler).toHaveBeenCalled();
        });
        it('text', function() {
            $empty.html('<td edit-type="text">');
            cellFactory.attachHandler($empty);
            expect(cellFactory.instances['text'].attachHandler).toHaveBeenCalled();
        });
        it('text-convertible', function() {
            $empty.html('<td edit-type="text-convertible">');
            cellFactory.attachHandler($empty);
            expect(cellFactory.instances['text-convertible'].attachHandler).toHaveBeenCalled();
        });
        it('button', function() {
            $empty.html('<td edit-type="button">');
            cellFactory.attachHandler($empty);
            expect(cellFactory.instances['button'].attachHandler).toHaveBeenCalled();
        });
        it('select', function() {
            $empty.html('<td edit-type="select">');
            cellFactory.attachHandler($empty);
            expect(cellFactory.instances['select'].attachHandler).toHaveBeenCalled();
        });
        it('존재하지 않는다면 호출하지 않았다.', function() {
            $empty.html('<td>');
            cellFactory.attachHandler($empty);
            _.each(cellFactory.instances, function(instance) {
                expect(instance.attachHandler).not.toHaveBeenCalled();
            });
        });
    });
});
